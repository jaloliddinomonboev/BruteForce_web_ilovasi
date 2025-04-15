document.getElementById('generator-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const form = this;
    const progressBar = document.getElementById('progress-bar');
    const progress = document.getElementById('progress');
    const passwordList = document.getElementById('password-list');
    passwordList.innerHTML = '';
    progressBar.style.display = 'block';
    progress.style.width = '0%';
    progress.textContent = '0%';

    form.submit();

    const lowercase = document.getElementById('lowercase').checked;
    const uppercase = document.getElementById('uppercase').checked;
    const digits = document.getElementById('digits').checked;
    const special = document.getElementById('special').checked;
    const customChars = document.getElementById('custom_chars').value;
    const minLength = parseInt(document.getElementById('min_length').value);
    const maxLength = parseInt(document.getElementById('max_length').value);

    let chars = '';
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (digits) chars += '0123456789';
    if (special) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    chars += customChars;
    chars = [...new Set(chars)].join('');

    let combinations = 0;
    for (let len = minLength; len <= maxLength; len++) {
        combinations += Math.pow(chars.length, len);
    }
    document.getElementById('combinations').textContent = combinations.toLocaleString();

    let progressValue = 0;
    const interval = setInterval(() => {
        progressValue += 20;
        progress.style.width = `${progressValue}%`;
        progress.textContent = `${progressValue}%`;
        if (progressValue >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                progressBar.style.display = 'none';
            }, 500);
        }
    }, 200);
});

const inputs = ['lowercase', 'uppercase', 'digits', 'special', 'custom_chars', 'min_length', 'max_length'];
inputs.forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
        const lowercase = document.getElementById('lowercase').checked;
        const uppercase = document.getElementById('uppercase').checked;
        const digits = document.getElementById('digits').checked;
        const special = document.getElementById('special').checked;
        const customChars = document.getElementById('custom_chars').value;
        const minLength = parseInt(document.getElementById('min_length').value);
        const maxLength = parseInt(document.getElementById('max_length').value);

        let chars = '';
        if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (digits) chars += '0123456789';
        if (special) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        chars += customChars;
        chars = [...new Set(chars)].join('');

        let combinations = 0;
        for (let len = minLength; len <= maxLength; len++) {
            combinations += Math.pow(chars.length, len);
        }
        document.getElementById('combinations').textContent = combinations.toLocaleString();
    });
});