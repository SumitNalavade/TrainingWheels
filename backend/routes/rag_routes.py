import os
from flask import Blueprint, request, jsonify

from embeddings.openai_embeddings import openai_embeddings
from database.pg_vector_store import build_pg_vector_store
from chains.conversational_retrieval_chain_with_memory import build_conversational_retrieval_chain_with_memory
from langchain.chat_models import ChatOpenAI

from database.database import db, File

rag_routes_bp = Blueprint('rag_routes', __name__)

database_uri = os.getenv("DATABASE_URI")

llm = ChatOpenAI()


@rag_routes_bp.route("/search", methods=['POST'])
def search():
    data = request.get_json()
    user_id = data.get('user_id')
    query = data.get("query")
    conversation_id = data.get("conversation_id")

    # Build the vector store and retriever
    collection_name = user_id
    pg_vector_store = build_pg_vector_store(
        embeddings_model=openai_embeddings, collection_name=collection_name, connection_uri=database_uri)
    pg_vector_retriever = pg_vector_store.as_retriever(search_type="mmr")

    # Create the retrieval QA chain
    retrieval_qa_chain = build_conversational_retrieval_chain_with_memory(
        llm, pg_vector_retriever, conversation_id)

    # Run the query
    result = retrieval_qa_chain.run(query)

    # Construct the response dictionary
    response = {
        "session_id": conversation_id,
        "type": "ai",
        "data": {
                "content": result
        }
    }

    return jsonify(response)
