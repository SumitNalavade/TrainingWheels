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

@app.route("/user-get-file", methods=["GET"])
def get_file():
    '''
    Given a user_id, all associated urls and their corresponding file names will be returned.

    Input: 
        1. user_id : user id of the user whose files and urls need to be retrieved
    '''

    try:
        #input validation: user_id
        if 'user_id' not in request.args:
            return jsonify({"error": "No user_id provided in the request"}), 400

        #access the user id
        user_id = request.args['user_id']

        #retrieve all associated URLs and file names and turn it into a list of dicts
        files = db.session.query(File.url, File.name).filter(File.user_id == user_id).all()
        results = [{"url": file.url, "name": file.name} for file in files]

        return jsonify(results), 200
    
    except Exception as e:
        print("Error @ /user-get-file ||", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route("/user-delete-file", methods=["DELETE"])
def delete_file():
    '''
    Given a user_id and a filename, a particular user's file will be deleted from the file table and supabase if it exists. 

    Input: 
        1. user_id : user id of the user whose file needs to be deleted
        2. filename : the name of the file which needs to be deleted
    '''
    try:
        #input validation: user_id
        if 'user_id' not in request.args:
            return jsonify({"error": "No user_id provided in the request"}), 400

        #access the user id
        user_id = request.args['user_id']

        #input validation: filename
        if 'filename' not in request.args:
            return jsonify({"error": "No filename provided in the request"}), 400

        #access the filename
        filename = request.args['filename']

        #perform deletion on supabase
        supabase.storage.from_(supabase_bucket_name).remove([filename])

        #perform deletion on the file table
        db.session.query(File).filter(File.name == filename, File.user_id == user_id).delete()
        db.session.commit()

        return jsonify({"status": "successful"}), 200
    
    except Exception as e:
        print("Error @ /user-delete-file ||", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
    
@app.route("/user-delete-all-file", methods=["DELETE"])
def delete_all_file():
    '''
    Given a user_id, delete all their associated files in the file table.

    Input: 
        1. user_id : user id of the user whose files needs to be deleted
    '''
    try:
        #input validation: user_id
        if 'user_id' not in request.args:
            return jsonify({"error": "No user_id provided in the request"}), 400

        #access the user id
        user_id = request.args['user_id']

        #identify the filenames of all the files that belong to user_id user
        file_names = db.session.query(File.name).filter(File.user_id == user_id).all()
        names = [file.name for file in file_names]

        print(names)

        #delete each file from supabase
        for name in names:
            supabase.storage.from_(supabase_bucket_name).remove([name])

        #access the user id 
        user_id = request.args['user_id']

        #perform deletion on the file table
        db.session.query(File).filter(File.user_id == user_id).delete()
        db.session.commit()

        return jsonify({"status": "successful"}), 200
    
    except Exception as e:
        print("Error @ /user-delete-all-file ||", e)
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
