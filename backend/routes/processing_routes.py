import os
from flask import Blueprint, request, jsonify
import tempfile

from embeddings.openai_embeddings import openai_embeddings

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFLoader
from langchain_postgres import PGVector
from langchain_postgres.vectorstores import PGVector
from pdf2image import convert_from_path
from PIL import Image
import pytesseract

processing_routes_bp = Blueprint('processing_routes', __name__)

database_uri = os.getenv("DATABASE_URI")

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

@processing_routes_bp.route("/upload", methods=['POST'])
def test():
    file = request.files['file']

    upload_pdf("fcebf80c-cef7-4122-9a9f-35fb3a6c588b", file)

    return "success"