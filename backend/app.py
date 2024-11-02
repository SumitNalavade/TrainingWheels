import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import langchain
from dotenv import load_dotenv

from database.database import db

from chains.conversational_retrieval_chain_with_memory import build_conversational_retrieval_chain_with_memory
from langchain.chat_models import ChatOpenAI
from database.pg_vector_store import build_pg_vector_store
from embeddings.openai_embeddings import openai_embeddings

from routes.auth_routes import auth_routes_bp
from routes.processing_routes import processing_routes_bp

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

@app.route("/search", methods=['POST'])
def search():
    data = request.get_json()
    user_id = data.get('user_id')
    query = data.get("query")
    conversation_id = data.get("conversation_id")

    # Build the vector store and retriever
    collection_name = user_id
    pg_vector_store = build_pg_vector_store(embeddings_model=openai_embeddings, collection_name=collection_name, connection_uri=database_uri)
    pg_vector_retriever = pg_vector_store.as_retriever(search_type="mmr")

    # Create the retrieval QA chain
    retrieval_qa_chain = build_conversational_retrieval_chain_with_memory(llm, pg_vector_retriever, conversation_id)

    # Run the query
    result = retrieval_qa_chain.run(query)

    # Construct the response dictionary
    response = {
        "session_id": conversation_id,
        "message": {
            "type": "ai",
            "data": {
                "content": result
            }
        }
    }

    return jsonify(response)

def register_blueprints(app):
    app.register_blueprint(auth_routes_bp)
    app.register_blueprint(processing_routes_bp)

register_blueprints(app)

if __name__ == '__main__':
    app.run(debug=True)