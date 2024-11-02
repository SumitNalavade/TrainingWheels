import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import langchain
from dotenv import load_dotenv

from database.database import db, File

from chains.conversational_retrieval_chain_with_memory import build_conversational_retrieval_chain_with_memory
from langchain.chat_models import ChatOpenAI
from database.pg_vector_store import build_pg_vector_store
from embeddings.openai_embeddings import openai_embeddings

from routes.auth_routes import auth_routes_bp
from routes.processing_routes import processing_routes_bp

from supabase import create_client, Client

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
supabase_bucket_name = "user_content"

#connecting to supabase table
supabase: Client = create_client(supabase_url, supabase_key)

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


@app.route("/user-add-file", methods=["POST"])
def add_file():
    '''
    Receives a file as input and stores it into Supabase blob storage. 
    After storing it, it will make an entry into the files table with the link.

    Input: 
        1. A file  : file that the user wants to add to their database of files
        2. user_id : user id of the user who wants to add a file
    '''
    try:
        #input validation: file
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
        
        #access the file and process information
        file = request.files['file']
        file_content = file.read()
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        #input validation: user_id
        if 'user_id' not in request.args:
            return jsonify({"error": "No user_id provided in the request"}), 400

        #access the user id
        user_id = request.args['user_id']

        #add the file to the supabase bucket
        response = (
            supabase.storage
            .from_(supabase_bucket_name)
            .upload(file.filename, file_content)
        )

        #retreive the url of the file from the supabase bucket
        public_url = supabase.storage.from_(supabase_bucket_name).get_public_url(file.filename)
        file_type = file.filename.rsplit('.', 1)[-1].lower() 
        print("File type:", file_type)


        #add an entry into the files table
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
        return jsonify({"status": "successful", "file_id": new_file.id}), 200
    
    except Exception as e:
        print("Error @ /user-add-file ||", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
    
def register_blueprints(app):
    app.register_blueprint(auth_routes_bp)
    app.register_blueprint(processing_routes_bp)

register_blueprints(app)

if __name__ == '__main__':
    app.run(debug=True)
