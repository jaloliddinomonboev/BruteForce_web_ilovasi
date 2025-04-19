from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required
from db import db
from models.user import User
from datetime import datetime

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()

        if user:
            if user.is_blocked:
                flash('Sizning hisobingiz bloklangan!', 'danger')
                return redirect(url_for('auth.login'))

            if user.check_password(password):
                user.last_login = datetime.utcnow()  # Oxirgi kirish vaqtini yangilash
                db.session.commit()
                login_user(user)
                flash('Tizimga muvaffaqiyatli kirdingiz!', 'success')
                return redirect(url_for('index'))
            else:
                flash('Parol noto‘g‘ri!', 'danger')
        else:
            flash('Foydalanuvchi topilmadi!', 'danger')
    return render_template('login.html')


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')

        if User.query.filter_by(email=email).first():
            flash('Bu email allaqachon ro‘yxatdan o‘tgan!', 'danger')
            return redirect(url_for('auth.register'))

        if User.query.filter_by(name=name).first():
            flash('Bu ism allaqachon ro‘yxatdan o‘tgan!', 'danger')
            return redirect(url_for('auth.register'))

        user = User(name=name, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        login_user(user)
        flash('Ro‘yxatdan o‘tish muvaffaqiyatli!', 'success')
        return redirect(url_for('index'))
    return render_template('register.html')


@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Tizimdan chiqdingiz!', 'success')
    return redirect(url_for('index'))