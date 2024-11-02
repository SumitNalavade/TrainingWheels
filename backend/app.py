import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import langchain
from dotenv import load_dotenv
import tempfile
import psycopg2 

from database.database import db, User, bcrypt

from chains.conversational_retrieval_chain_with_memory import build_conversational_retrieval_chain_with_memory
from langchain.chat_models import ChatOpenAI
from database.pg_vector_store import build_pg_vector_store
from embeddings.openai_embeddings import openai_embeddings

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import TextLoader, PyPDFLoader
from langchain_postgres import PGVector
from langchain_postgres.vectorstores import PGVector
from langchain.embeddings import OpenAIEmbeddings
from pdf2image import convert_from_path
from PIL import Image
import pytesseract

load_dotenv()

app = Flask(__name__)
CORS(app)

langchain.verbose = True

# Load database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
database_uri = os.getenv('DATABASE_URI')
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_KEY')


# Creating all tables
with app.app_context():
    db.init_app(app)
    db.create_all()

llm = ChatOpenAI()
collection_name = "test"
pg_vector_store = build_pg_vector_store(embeddings_model=openai_embeddings, collection_name=collection_name, connection_uri=database_uri)
pg_vector_retriever = pg_vector_store.as_retriever(search_type="mmr")

retrieval_qa_chain = build_conversational_retrieval_chain_with_memory(
        llm, pg_vector_retriever, '123')

# Basic hello world route
@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/signup", methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    # Check if a user exists and if so, send an error message
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({ 'error': 'User with this email already exists' }), 400

    try:
        # Hash the user password before storing it in the db
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        new_user = User(name=name, email=email, password=hashed_password)

        db.session.add(new_user)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': "Something went wrong!" }), 500
    
    # Create a new record in langchain_pg_collection with the collection_name being the id of the user
    try:
        collection_name = new_user.id
        build_pg_vector_store(embeddings_model=openai_embeddings, collection_name=collection_name, connection_uri=database_uri)        
    except:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': "Something went wrong!" }), 500

    return jsonify({ 'id': new_user.id, "name": new_user.name, "email": new_user.email }), 201

@app.route("/signin", methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    try:
        # Check if a user with the email and password exists, and if not, send an error message
        user = User.query.filter_by(email=email).first()

        if(user is None or not bcrypt.check_password_hash(user.password, password)):
            return jsonify({ 'error': 'Invalid credentials' }), 403
        
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Something went wrong!' }), 500
        
    return jsonify({ 'id': user.id, 'name': user.name, 'email': user.email }), 200

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


@app.route("/upload", methods=['POST'])
def test():
    file = request.files['file']

    upload_pdf("52cf5a13-795b-41d8-85d9-c27fcf7ca88e", file)

    return "success"

if __name__ == '__main__':
    app.run(debug=True)