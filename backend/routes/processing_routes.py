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

from database.database import db, File

processing_routes_bp = Blueprint('processing_routes', __name__)

database_uri = os.getenv("DATABASE_URI")
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_KEY')
supabase_bucket_name = "user_content"

#connecting to supabase table
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
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=0)
    
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
            print(f"Error cleaning up temporary file {tmp_path}: {cleanup_error}")

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
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=0)
    
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
            print(f"Error cleaning up temporary file {tmp_path}: {cleanup_error}")

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

        if(content_type == 'image/png'):
            upload_image(user_id, file)
        elif(content_type == 'application/pdf'):
            upload_pdf(user_id, file)
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
        public_url = supabase.storage.from_(supabase_bucket_name).get_public_url(file.filename)
        
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

# @processing_routes_bp.route("/upload", methods=['POST'])
# def test():
#     file = request.files['file']

#     upload_pdf("fcebf80c-cef7-4122-9a9f-35fb3a6c588b", file)

#     return "success"