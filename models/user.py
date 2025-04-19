from flask_login import UserMixin
from db import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)
    is_blocked = db.Column(db.Boolean, default=False, nullable=False)
    profile_image = db.Column(db.String(120), nullable=True)  # Profil rasmi uchun maydon
    histories = db.relationship('PasswordHistory', back_populates='user', lazy=True)  # backref o‘rniga back_populates

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)