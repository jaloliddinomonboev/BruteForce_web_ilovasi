from flask import Blueprint, jsonify, request, send_file, render_template
from flask_login import login_required, current_user
from db import db
from models.history import PasswordHistory
import json
import io

history_bp = Blueprint('history', __name__)

@history_bp.route('/')
@login_required
def history():
    return render_template('history.html')

@history_bp.route('/api/history', methods=['GET'])
@login_required
def get_history():
    filter_text = request.args.get('filter', '')
    filter_type = request.args.get('type', 'all')

    query = PasswordHistory.query.filter_by(user_id=current_user.id)
    if filter_text:
        query = query.filter(PasswordHistory.description.ilike(f'%{filter_text}%'))
    if filter_type != 'all':
        query = query.filter_by(type=filter_type)

    history = query.all()
    return jsonify([{
        'id': h.id,
        'date': h.date.strftime('%Y-%m-%d %H:%M:%S'),
        'description': h.description,
        'type': h.type,
        'count': h.count,
        'passwords': json.loads(h.passwords)
    } for h in history])

@history_bp.route('/api/history', methods=['POST'])
@login_required
def add_history():
    data = request.get_json()
    passwords = data.get('passwords', [])
    description = data.get('description', 'Noma’lum')
    type = data.get('type', 'standard')

    history = PasswordHistory(
        user_id=current_user.id,
        description=description,
        type=type,
        count=len(passwords),
        passwords=json.dumps(passwords)
    )
    db.session.add(history)
    db.session.commit()
    return jsonify({'message': 'Tarix muvaffaqiyatli saqlandi!', 'id': history.id}), 201

@history_bp.route('/api/history/<int:id>', methods=['PUT'])
@login_required
def edit_history(id):
    data = request.get_json()
    history = PasswordHistory.query.filter_by(id=id, user_id=current_user.id).first()
    if not history:
        return jsonify({'error': 'Tarix topilmadi yoki ruxsat yo‘q!'}), 404

    history.description = data.get('description', history.description)
    passwords = data.get('passwords', json.loads(history.passwords))
    history.passwords = json.dumps(passwords)
    history.count = len(passwords)
    db.session.commit()
    return jsonify({'message': 'Tarix muvaffaqiyatli yangilandi!'})

@history_bp.route('/api/history/<int:id>', methods=['DELETE'])
@login_required
def delete_history(id):
    history = PasswordHistory.query.filter_by(id=id, user_id=current_user.id).first()
    if not history:
        return jsonify({'error': 'Tarix topilmadi yoki ruxsat yo‘q!'}), 404

    db.session.delete(history)
    db.session.commit()
    return jsonify({'message': 'Tarix muvaffaqiyatli o‘chirildi!'})

@history_bp.route('/api/history/<int:id>/download', methods=['GET'])
@login_required
def download_history(id):
    history = PasswordHistory.query.filter_by(id=id, user_id=current_user.id).first()
    if not history:
        return jsonify({'error': 'Tarix topilmadi yoki ruxsat yo‘q!'}), 404

    passwords = json.loads(history.passwords)
    file_content = '\n'.join(passwords)
    return send_file(
        io.BytesIO(file_content.encode('utf-8')),
        mimetype='text/plain',
        as_attachment=True,
        download_name=f'passwords_{id}.txt'
    )

@history_bp.route('/api/history', methods=['POST'])
@login_required
def save_history():
    data = request.get_json()
    description = data.get('description')
    type = data.get('type')
    passwords = data.get('passwords', [])

    history = PasswordHistory(
        user_id=current_user.id,
        description=description,
        type=type,
        count=len(passwords),
        passwords=json.dumps(passwords)
    )
    db.session.add(history)
    db.session.commit()

    return jsonify({'status': 'success'})

