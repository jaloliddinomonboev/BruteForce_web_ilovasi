from db import db
from datetime import datetime

class PasswordHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.String(200), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    count = db.Column(db.Integer, nullable=False)
    passwords = db.Column(db.Text, nullable=False)

    user = db.relationship('User', back_populates='histories')  # back_populates ishlatildi

