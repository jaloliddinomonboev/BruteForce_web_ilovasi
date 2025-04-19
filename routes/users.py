from flask import Blueprint, render_template, request, jsonify, redirect, url_for
from flask_login import current_user, login_required
from db import db
from models.user import User
from models.history import PasswordHistory

users_bp = Blueprint('users', __name__)


@users_bp.route('/users')
@login_required
def users_page():
    if current_user.email != 'otaxonovnematjon@gmail.com':
        return redirect(url_for('index'))

    # Qidiruv va filtrlash parametrlari
    search_query = request.args.get('search', '')
    filter_status = request.args.get('status', 'all')

    users_query = User.query

    # Qidiruv
    if search_query:
        users_query = users_query.filter(
            (User.name.ilike(f'%{search_query}%')) |
            (User.email.ilike(f'%{search_query}%'))
        )

    # Filtrlash
    if filter_status == 'active':
        users_query = users_query.filter_by(is_blocked=False)
    elif filter_status == 'blocked':
        users_query = users_query.filter_by(is_blocked=True)

    users = users_query.all()

    # Har bir foydalanuvchi uchun statistik ma'lumotlar
    for user in users:
        user.password_count = PasswordHistory.query.filter_by(user_id=user.id).count()

    return render_template('users.html', users=users, search_query=search_query, filter_status=filter_status)


@users_bp.route('/api/delete_user', methods=['POST'])
@login_required
def delete_user():
    if current_user.email != 'otaxonovnematjon@gmail.com':
        return jsonify({"success": False, "message": "Faqat admin foydalanuvchilar o‘chirishi mumkin!"}), 403

    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({"success": False, "message": "Foydalanuvchi nomi kiritilmadi!"})

    user = User.query.filter_by(name=name).first()
    if not user:
        return jsonify({"success": False, "message": "Foydalanuvchi topilmadi!"})

    db.session.delete(user)
    db.session.commit()
    return jsonify({"success": True, "message": "Foydalanuvchi o'chirildi!"})


@users_bp.route('/api/toggle_block_user', methods=['POST'])
@login_required
def toggle_block_user():
    if current_user.email != 'otaxonovnematjon@gmail.com':
        return jsonify({"success": False, "message": "Faqat admin foydalanuvchilar bloklashi mumkin!"}), 403

    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({"success": False, "message": "Foydalanuvchi nomi kiritilmadi!"})

    user = User.query.filter_by(name=name).first()
    if not user:
        return jsonify({"success": False, "message": "Foydalanuvchi topilmadi!"})

    user.is_blocked = not user.is_blocked  # Bloklash/ochish
    db.session.commit()
    action = "bloklandi" if user.is_blocked else "ochildi"
    return jsonify({"success": True, "message": f"Foydalanuvchi {action}!"})