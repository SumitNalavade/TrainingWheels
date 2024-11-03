import os
from flask import Blueprint, request, jsonify
import tempfile

from supabase import create_client, Client

from embeddings.openai_embeddings import openai_embeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFLoader
from langchain_postgres import PGVector
from langchain_postgres.vectorstores import PGVector
from pdf2image import convert_from_path
from PIL import Image
import pytesseract
import re

import speech_recognition as sr
from moviepy.editor import VideoFileClip

from database.database import db, File, User
from custom_models.topic_modelling import predict

processing_routes_bp = Blueprint('processing_routes', __name__)

database_uri = os.getenv("DATABASE_URI")
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_KEY')
supabase_bucket_name = "user_content"

# connecting to supabase table
supabase: Client = create_client(supabase_url, supabase_key)


def upload_pdf(user_id, file):
    '''
    Loads vectorized knowledge base embeddings into vector database (PGVector).

    Iterates through knowledge base, calculates 1536 dimensional vector embeddings for each document and stores them in vector database.

    Chunk size is currently set to 200 with an overlap of 0. This may have to be adjusted in the future.

    Note: This function calls OpenAIEmbeddings() which costs money to run and can be fairly expensive so try to limit this operation.
          Ideally, the vector database should only need to be loaded initially and whenever we have new data
    '''

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(file.read())
        tmp_path = tmp.name

    # Initialize the text splitter for document chunking
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=200, chunk_overlap=0)

    # Initialize the vector store with the given user ID as the collection name
    vector_store = PGVector(
        embeddings=openai_embeddings,
        collection_name=user_id,
        connection=database_uri,
        use_jsonb=True,
    )

    try:
        # Load and split the document
        loader = PyPDFLoader(tmp_path)
        docs = loader.load_and_split(text_splitter=text_splitter)

        # Add documents to the vector store
        vector_store.add_documents(docs)

        print(f"Successfully processed and uploaded {file.filename}")

    except Exception as e:
        print(f"Error processing file {file.filename}: {e}")
    finally:
        # Ensure the temporary file is deleted after processing
        try:
            os.remove(tmp_path)
        except Exception as cleanup_error:
            print(
                f"Error cleaning up temporary file {tmp_path}: {cleanup_error}")


def upload_image(user_id, file):
    '''
    Loads vectorized knowledge base embeddings from images into vector database (PGVector).
    Processes both images and PDFs containing images, extracts text using OCR,
    calculates 1536 dimensional vector embeddings for each chunk and stores them in vector database.
    Chunk size is currently set to 200 with an overlap of 0. This may need to be adjusted.
    Note: This function calls OpenAIEmbeddings() which costs money to run.
    '''
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        tmp.write(file.read())
        tmp_path = tmp.name

    # Initialize the text splitter for document chunking
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=200, chunk_overlap=0)

    # Initialize the vector store with the given user ID as the collection name
    vector_store = PGVector(
        embeddings=openai_embeddings,
        collection_name=user_id,
        connection=database_uri,
        use_jsonb=True,
    )

    try:
        full_text = ""

        # Handle PDFs containing images
        if file.filename.lower().endswith('.pdf'):
            images = convert_from_path(tmp_path)
            for image in images:
                text = pytesseract.image_to_string(image)
                full_text += text + "\n"

        # Handle direct image uploads
        elif file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            with Image.open(tmp_path) as img:
                full_text = pytesseract.image_to_string(img)

        # Split the extracted text into chunks
        if full_text.strip():
            docs = text_splitter.create_documents([full_text])

            # Add documents to the vector store
            vector_store.add_documents(docs)
            print(f"Successfully processed and uploaded {file.filename}")
        else:
            print(f"No text could be extracted from {file.filename}")

    except Exception as e:
        print(f"Error processing file {file.filename}: {e}")

    finally:
        # Ensure the temporary file is deleted after processing
        try:
            os.remove(tmp_path)
        except Exception as cleanup_error:
            print(
                f"Error cleaning up temporary file {tmp_path}: {cleanup_error}")
            
def upload_video(user_id: str, file):
    '''
    Transcribes an uploaded video file to text and loads the transcription into a vector database.
    Creates temporary files for processing, performs speech-to-text conversion, and stores
    vectorized embeddings in PGVector database.
    
    Parameters:
    user_id (str): Unique identifier for the user uploading the file
    file: File object from the upload request
    
    Note: This function creates temporary files which are cleaned up after processing.
    Transcription relies on Google Speech Recognition API and OpenAI embeddings which
    may have associated costs.
    '''
    recognizer = sr.Recognizer()
    output_folder = f'transcribed-files/{user_id}'
    
    # Initialize text splitter for document chunking
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=200,
        chunk_overlap=0
    )
    
    # Initialize vector store
    vector_store = PGVector(
        embeddings=openai_embeddings,
        collection_name=user_id,
        connection=database_uri,
        use_jsonb=True,
    )
    
    # Ensure output folder exists
    os.makedirs(output_folder, exist_ok=True)
    
    # Create temporary video file
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_video:
        tmp_video.write(file.read())
        video_path = tmp_video.name
        
        try:
            # Create temporary audio file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_audio:
                temp_audio_path = tmp_audio.name
                
                try:
                    # Extract audio from video
                    video = VideoFileClip(video_path)
                    video.audio.write_audiofile(temp_audio_path)
                    
                    # Perform transcription
                    with sr.AudioFile(temp_audio_path) as source:
                        audio = recognizer.record(source)
                        try:
                            text = recognizer.recognize_google(audio)
                        except sr.UnknownValueError:
                            text = "Could not understand audio"
                            # Log failed transcription
                            with open(f'transcribed-err/{user_id}.txt', 'a') as txt_err_file:
                                txt_err_file.write(file.filename + '\n')
                            raise Exception("Could not understand audio")
                        except sr.RequestError as e:
                            text = f"Error with the request: {e}"
                            raise
                    
                    # Save transcription
                    txt_filename = os.path.splitext(file.filename)[0] + '.txt'
                    txt_path = os.path.join(output_folder, txt_filename)
                    with open(txt_path, 'w') as txt_file:
                        txt_file.write(text)
                    
                    # Create document chunks and add to vector store
                    docs = text_splitter.create_documents([text], metadatas=[{"source": file.filename}])
                    vector_store.add_documents(docs)
                    
                    print(f"Successfully processed and uploaded {file.filename}")
                    return txt_path
                    
                finally:
                    # Cleanup: Close video file and remove temporary files
                    if 'video' in locals():
                        video.close()
                    try:
                        os.remove(temp_audio_path)
                    except Exception as cleanup_error:
                        print(f"Error cleaning up temporary audio file: {cleanup_error}")
        
        except Exception as e:
            print(f"Error processing file {file.filename}: {e}")
            raise
            
        finally:
            # Ensure the temporary video file is deleted
            try:
                os.remove(video_path)
            except Exception as cleanup_error:
                print(f"Error cleaning up temporary video file: {cleanup_error}")


@processing_routes_bp.route("/upload", methods=["POST"])
def add_file():
    '''
    Receives a file as input and stores it into Supabase blob storage.
    After storing it, it will make an entry into the files table with the link.
    Input:
        1. A file : file that the user wants to add to their database of files
        2. user_id : user id of the user who wants to add a file
    '''
    try:
        # Input validation: file
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files['file']
        user_id = request.args['user_id']

        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Input validation: user_id
        if 'user_id' not in request.args:
            return jsonify({"error": "No user_id provided in the request"}), 400

        # Get file type and determine content-type
        file_type = file.filename.rsplit('.', 1)[-1].lower()
        content_type = file.content_type or 'application/octet-stream'

        if (content_type == 'image/png'):
            upload_image(user_id, file)
        elif (content_type == 'application/pdf'):
            upload_pdf(user_id, file)
        elif(content_type == 'video/mp4'):
            upload_video(user_id, file)
            
        else:
            return jsonify({"error": "File format not supported"}), 400

        # Create a temporary file to handle the upload
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            file.save(temp_file.name)

            # Upload to Supabase with proper content-type
            with open(temp_file.name, 'rb') as f:
                response = supabase.storage.from_(supabase_bucket_name).upload(
                    file=f,
                    path=file.filename,
                    file_options={"content-type": content_type}
                )

        # Clean up temporary file
        os.unlink(temp_file.name)

        # Retrieve the public URL
        public_url = supabase.storage.from_(
            supabase_bucket_name).get_public_url(file.filename)

        # Add entry to the files table
        new_file = File(
            url=public_url,
            name=file.filename,
            type=file_type,
            user_id=user_id
        )

        # Add the new file to the session and commit
        db.session.add(new_file)
        db.session.commit()

        print("/user-add-file successfully added a file to the database")
        return jsonify({
            "status": "successful",
            "file_id": new_file.id
        }), 200

    except Exception as e:
        print("Error @ /user-add-file ||", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@processing_routes_bp.route("/get_file", methods=["GET"])
def get_file():
    '''
    Given a user_id, all associated urls and their corresponding file names will be returned.

    Input: 
        1. user_id : user id of the user whose files and urls need to be retrieved
    '''

    try:
        # input validation: user_id
        if 'user_id' not in request.args:
            return jsonify({"error": "No user_id provided in the request"}), 400

        # access the user id
        user_id = request.args['user_id']

        # retrieve all associated URLs and file names and turn it into a list of dicts
        files = db.session.query(File.url, File.name, File.type).filter(
            File.user_id == user_id).all()
        results = [{"url": file.url, "name": file.name, "type": file.type} for file in files]

        return jsonify(results), 200

    except Exception as e:
        print("Error @ /user-get-file ||", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@processing_routes_bp.route("/delete_file", methods=["DELETE"])
def delete_file():
    '''
    Given a user_id and a filename, a particular user's file will be deleted from the file table and supabase if it exists. 

    Input: 
        1. user_id : user id of the user whose file needs to be deleted
        2. filename : the name of the file which needs to be deleted
    '''
    try:
        # input validation: user_id
        if 'user_id' not in request.args:
            return jsonify({"error": "No user_id provided in the request"}), 400

        # access the user id
        user_id = request.args['user_id']

        # input validation: filename
        if 'filename' not in request.args:
            return jsonify({"error": "No filename provided in the request"}), 400

        # access the filename
        filename = request.args['filename']

        # perform deletion on supabase
        supabase.storage.from_(supabase_bucket_name).remove([filename])

        # perform deletion on the file table
        db.session.query(File).filter(File.name == filename,
                                      File.user_id == user_id).delete()
        db.session.commit()

        return jsonify({"status": "successful"}), 200

    except Exception as e:
        print("Error @ /user-delete-file ||", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@processing_routes_bp.route("/delete_all_files", methods=["DELETE"])
def delete_all_file():
    '''
    Given a user_id, delete all their associated files in the file table.

    Input: 
        1. user_id : user id of the user whose files needs to be deleted
    '''
    try:
        # input validation: user_id
        if 'user_id' not in request.args:
            return jsonify({"error": "No user_id provided in the request"}), 400

        # access the user id
        user_id = request.args['user_id']

        # identify the filenames of all the files that belong to user_id user
        file_names = db.session.query(File.name).filter(
            File.user_id == user_id).all()
        names = [file.name for file in file_names]

        print(names)

        # delete each file from supabase
        for name in names:
            supabase.storage.from_(supabase_bucket_name).remove([name])

        # access the user id
        user_id = request.args['user_id']

        # perform deletion on the file table
        db.session.query(File).filter(File.user_id == user_id).delete()
        db.session.commit()

        return jsonify({"status": "successful"}), 200

    except Exception as e:
        print("Error @ /user-delete-all-file ||", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@processing_routes_bp.route("/get-key-topics", methods=["GET"])
def get_key_topics():
    '''
    Given a user_id, get the n most major topics

    Input: 
        1. user_id : user id of the user 
        2. num_topics (optional, default: 3) : the number of unqiue topics of user discussion to be identified
        3. num_words (optional, default: 3) : the number of unique words of user discussion to be identified for each topic
    '''
    try:
        # input validation: user_id
        if 'user_id' not in request.args:
            return jsonify({"error": "No user_id provided in the request"}), 400

        # access the user id
        user_id = request.args['user_id']

        if 'num_topics' in request.args:
            # access the user id
            num_topics = int(request.args['num_topics'])
        
        if 'num_words' in request.args:
            # access the user id
            num_words = int(request.args['num_words'])

        
        print("User ID: ", user_id)
        user = User.query.filter_by(id=user_id).first()
        print("User", user)
        corpus = user.message_ids

        predictions = predict(corpus, num_words, num_topics, model = 'lda')

        extracted_strings = [quote for item in predictions for quote in re.findall(r'"(.*?)"', item[1])]

        return jsonify(extracted_strings), 200
    except Exception as e:
        print("Error @ /get-key-topics ||", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@processing_routes_bp.route("/get-data-distribution", methods=["GET"])
def get_data_distribution():
    '''
    Given a user_id, get a dictinary returning the distribution of data with regards to file type

    Input: 
        1. user_id : user id of the user 
    '''

    # input validation: user_id
    if 'user_id' not in request.args:
        return jsonify({"error": "No user_id provided in the request"}), 400

    # access the user id
    user_id = request.args['user_id']
    user = User.query.filter_by(id=user_id).first()

    files = db.session.query(File).filter(File.user_id == user_id).all()

    # Initialize dictionary to count file types
    type_dict = {}

    # Count occurrences of each file type
    possible_file_types = ['png', 'pdf', 'jpg', 'jpeg', 'mp4', 'mov']
    pftdict = {file_type: 0 for file_type in possible_file_types}

    for file in files:
        if file.type in possible_file_types:
            pftdict[file.type] += 1

    return jsonify(pftdict), 200  