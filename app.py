from flask import Flask, request, render_template, send_file
from generator import generate_passwords, calculate_combinations
import os
from io import BytesIO
import zipfile

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    combinations = 0
    error = None
    if request.method == 'POST':
        try:
            use_lowercase = 'lowercase' in request.form
            use_uppercase = 'uppercase' in request.form
            use_digits = 'digits' in request.form
            use_special = 'special' in request.form
            custom_chars = request.form.get('custom_chars', '')
            min_len = int(request.form.get('min_length', 1))
            max_len = int(request.form.get('max_length', 2))
            max_count = int(request.form.get('max_count', 1000))

            chars = ''
            if use_lowercase:
                chars += 'abcdefghijklmnopqrstuvwxyz'
            if use_uppercase:
                chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            if use_digits:
                chars += '0123456789'
            if use_special:
                chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
            chars += custom_chars
            chars = ''.join(sorted(set(chars)))

            if not chars:
                error = "Belgilar to'plami bo'sh bo'lmasligi kerak!"
                return render_template('index.html', error=error, combinations=combinations)

            combinations = calculate_combinations(chars, min_len, max_len)
            passwords = list(generate_passwords(chars, min_len, max_len, max_count))

            output_file = 'wordlist.txt'
            with open(output_file, 'w', encoding='utf-8') as f:
                for pwd in passwords:
                    f.write(pwd + '\n')

            zip_buffer = BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                zip_file.write(output_file)
            zip_buffer.seek(0)

            if os.path.exists(output_file):
                os.remove(output_file)

            return send_file(
                zip_buffer,
                mimetype='application/zip',
                as_attachment=True,
                download_name='wordlist.zip'
            )
        except Exception as e:
            error = f"Xato yuz berdi: {str(e)}"
            return render_template('index.html', error=error, combinations=combinations)

    return render_template('index.html', combinations=combinations, error=error)

if __name__ == '__main__':
    app.run(debug=True)