from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from db import db
from models.user import User
import os
from werkzeug.utils import secure_filename

profile_bp = Blueprint('profile', __name__)


# Profil sahifasi
@profile_bp.route('/profile')
@login_required
def profile():
    return render_template('profile.html', user=current_user)


# Profilni tahrirlash
@profile_bp.route('/edit_profile', methods=['POST'])
@login_required
def edit_profile():
    name = request.form.get('name')
    email = request.form.get('email')
    profile_image = request.files.get('profile_image')

    # Ism va emailni yangilash
    if User.query.filter_by(name=name).first() and name != current_user.name:
        flash('Bu ism allaqachon ro‘yxatdan o‘tgan!', 'danger')
        return redirect(url_for('profile.profile'))

    if User.query.filter_by(email=email).first() and email != current_user.email:
        flash('Bu email allaqachon ro‘yxatdan o‘tgan!', 'danger')
        return redirect(url_for('profile.profile'))

    current_user.name = name
    current_user.email = email

    # Profil rasmini yangilash
    if profile_image:
        filename = secure_filename(profile_image.filename)
        # Faylni saqlash
        upload_folder = os.path.join('static', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, filename)
        profile_image.save(file_path)
        current_user.profile_image = filename

    db.session.commit()
    flash('Profil ma\'lumotlari muvaffaqiyatli yangilandi!', 'success')
    return redirect(url_for('profile.profile'))


# Parolni o'zgartirish
@profile_bp.route('/change_password', methods=['POST'])
@login_required
def change_password():
    current_password = request.form.get('current_password')
    new_password = request.form.get('new_password')
    confirm_password = request.form.get('confirm_password')

    # Joriy parolni tekshirish
    if not current_user.check_password(current_password):
        flash('Joriy parol noto‘g‘ri!', 'danger')
        return redirect(url_for('profile.profile'))

    # Yangi parol va tasdiqlash mosligini tekshirish
    if new_password != confirm_password:
        flash('Yangi parol va tasdiqlash mos kelmadi!', 'danger')
        return redirect(url_for('profile.profile'))

    # Parolni yangilash
    current_user.set_password(new_password)
    db.session.commit()
    flash('Parol muvaffaqiyatli yangilandi!', 'success')
    return redirect(url_for('profile.profile'))