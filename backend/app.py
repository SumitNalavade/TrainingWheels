import os
from flask import Flask, request
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

def register_blueprints(app):
    app.register_blueprint(auth_routes_bp)
    app.register_blueprint(processing_routes_bp)

register_blueprints(app)

if __name__ == '__main__':
    app.run(debug=True)