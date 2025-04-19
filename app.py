from flask import Flask, render_template
from flask_login import LoginManager
from dotenv import load_dotenv
import os
from db import db
from werkzeug.security import generate_password_hash

# .env faylini yuklash
load_dotenv()

# Flask ilovasini yaratish
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')

# instance papkasini yaratish
instance_path = os.path.join(os.path.dirname(__file__), 'instance')
os.makedirs(instance_path, exist_ok=True)

# Ma'lumotlar bazasi yo'lini sozlash
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(instance_path, "database.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'

# Ma'lumotlar bazasini sozlash
db.init_app(app)

# Login manager
login_manager = LoginManager(app)
login_manager.login_view = 'auth.login'

# Route'larni import qilish
from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.history import history_bp
from routes.generate import generate_bp
from routes.users import users_bp

# Blueprint'larni ro'yxatdan o'tkazish
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(profile_bp, url_prefix='/profile')
app.register_blueprint(history_bp, url_prefix='/history')
app.register_blueprint(generate_bp)
app.register_blueprint(users_bp)

# Ma'lumotlar bazasini yaratish va adminni qo‘shish
with app.app_context():
    from models.user import User
    from models.history import PasswordHistory
    db.create_all()

    # Adminni qo‘shish
    admin_email = 'otaxonovnematjon@gmail.com'
    admin_password = 'qwer1234'
    if not User.query.filter_by(email=admin_email).first():
        admin_user = User(name='admin', email=admin_email)
        admin_user.password = generate_password_hash(admin_password)  # Parolni to‘g‘ridan-to‘g‘ri shifrlash
        db.session.add(admin_user)
        db.session.commit()

# Foydalanuvchi yuklovchi
@login_manager.user_loader
def load_user(user_id):
    from models.user import User
    return User.query.get(int(user_id))

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/generate')
def generate():
    return render_template('generate.html')

if __name__ == '__main__':
    app.run(debug=True)