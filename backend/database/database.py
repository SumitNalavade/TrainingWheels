from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.types import UserDefinedType
from flask_bcrypt import Bcrypt
import uuid

db = SQLAlchemy()
bcrypt = Bcrypt()
class Vector(UserDefinedType):
    def get_col_spec(self):
        return "VECTOR(1536)"

    def bind_expression(self, bindvalue):
        return bindvalue

    def column_expression(self, col):
        return col
    
class User(db.Model):    
    id = db.Column(db.String(), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(), nullable=False)
    email = db.Column(db.String(), nullable=False, unique=True)
    password = db.Column(db.String(), nullable=False)
    message_ids = db.Column(ARRAY(db.String), nullable=True) 

    # Relationship to back-reference files associated with the user
    files = db.relationship('File', backref='user', lazy=True)

class File(db.Model):
    id = db.Column(db.String(), primary_key=True, default=lambda: str(uuid.uuid4()))
    url = db.Column(db.String(), nullable=False)
    name = db.Column(db.String(), nullable=False)
    type = db.Column(db.String(), nullable=False)

    user_id = db.Column(db.String(), db.ForeignKey('user.id'), nullable=False)