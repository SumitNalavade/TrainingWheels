import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import langchain
from dotenv import load_dotenv

from database.database import db

from routes.auth_routes import auth_routes_bp
from routes.processing_routes import processing_routes_bp
from routes.rag_routes import rag_routes_bp

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

# Basic hello world route
@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

def register_blueprints(app):
    app.register_blueprint(auth_routes_bp)
    app.register_blueprint(processing_routes_bp)
    app.register_blueprint(rag_routes_bp)

register_blueprints(app)

if __name__ == '__main__':
    app.run(debug=True)