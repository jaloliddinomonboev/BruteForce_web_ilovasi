from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
import random
import string

generate_bp = Blueprint('generate', __name__, url_prefix='/api')

@generate_bp.route('/generate', methods=['POST'])
@login_required  # Foydalanuvchi login qilgan bo‘lishi kerak
def generate_passwords():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Foydalanuvchi autentifikatsiya qilinmagan'}), 401

    data = request.get_json()
    lowercase = data.get('lowercase', False)
    uppercase = data.get('uppercase', False)
    digits = data.get('digits', False)
    special = data.get('special', False)
    length = data.get('length', 12)
    if length < 4:
        length =4
    if length >50:
        length =50
    mask = data.get('mask', '')
    custom_words = data.get('customWords', [])
    limit = data.get('limit', 10000)  # Standart 10,000
    if limit < 1:  # Minimal 1 ta kombinatsiya
        limit = 1
    if limit > 1000000:  # Maksimal 100,000 ta kombinatsiya
        limit = 1000000

    # Belgilar to'plamini shakllantirish
    chars = ''
    if lowercase:
        chars += string.ascii_lowercase
    if uppercase:
        chars += string.ascii_uppercase
    if digits:
        chars += string.digits
    if special:
        chars += '!@#$%^&*()'

    passwords = set()

    # Maska bo'yicha generatsiya
    if mask:
        char_sets = {
            '?l': string.ascii_lowercase,
            '?u': string.ascii_uppercase,
            '?d': string.digits,
            '?s': '!@#$%^&*()'
        }

        parts = []
        current = ''
        for char in mask:
            if char == '?' and current == '':
                current = char
            elif current == '?' and char in ['l', 'u', 'd', 's']:
                parts.append(char_sets['?' + char] or '')
                current = ''
            else:
                parts.append(char)
                current = ''

        generated = 0
        while len(passwords) < limit and generated < limit * 2:
            password = ''
            for part in parts:
                if len(part) == 1:
                    password += part
                else:
                    password += random.choice(part)
            passwords.add(password)
            generated += 1

    else:
        # Maxsus so'zlar bilan generatsiya
        if custom_words:
            passwords.update(custom_words)
            if chars:
                for word in custom_words:
                    for i in range(1, 4):
                        suffix = ''.join(random.choice(chars) for _ in range(i))
                        passwords.add(word + suffix)

        # Oddiy generatsiya
        if chars:
            generated = 0
            while len(passwords) < limit and generated < limit * 2:
                password = ''.join(random.choice(chars) for _ in range(length))
                passwords.add(password)
                generated += 1

    return jsonify({
        'passwords': list(passwords),
        'count': len(passwords)
    })