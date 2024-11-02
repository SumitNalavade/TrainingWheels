import os
from flask import Blueprint, request, jsonify

from database.database import db, User, bcrypt
from database.pg_vector_store import build_pg_vector_store
from embeddings.openai_embeddings import openai_embeddings

auth_routes_bp = Blueprint('auth_routes', __name__)

database_uri = os.getenv("DATABASE_URI")

@auth_routes_bp.route("/signup", methods=['POST'])
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

@auth_routes_bp.route("/signin", methods=['POST'])
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