let allPasswords = [];

document.getElementById('generateForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Forma ma'lumotlarini olish
    const lowercase = document.getElementById('lowercase').checked;
    const uppercase = document.getElementById('uppercase').checked;
    const digits = document.getElementById('digits').checked;
    const special = document.getElementById('special').checked;
    const length = parseInt(document.getElementById('length').value);
    if (length < 4) {
    document.getElementById('length').value = 4;
    }
    if (length > 50) {
    document.getElementById('length').value = 50;
    }
    const mask = document.getElementById('mask').value.trim();
    const customWords = document.getElementById('customWords').value.trim().split('\n').filter(word => word.trim());
    const limit = parseInt(document.getElementById('limit').value);
    if (limit < 1) {
    document.getElementById('limit').value = 1;
    }
    if (limit > 1000000) {
    document.getElementById('limit').value = 1000000;
    }


    // Natijalar maydoni
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    allPasswords = [];

    // Agar hech narsa tanlanmagan bo'lsa
    if (!lowercase && !uppercase && !digits && !special && !mask && !customWords.length) {
        resultDiv.innerHTML = '<p class="text-danger">Iltimos, kamida bitta belgi to‘plami, maska yoki maxsus so‘z kiriting!</p>';
        document.getElementById('exportBtn').disabled = true;
        return;
    }

    // Ta'rif va turini yaratish
    let description = '';
    let type = '';
    if (mask) {
        description = `Maska: ${mask}`;
        type = 'mask';
    } else if (customWords.length) {
        description = `Maxsus so‘zlar: ${customWords.slice(0, 3).join(', ')}${customWords.length > 3 ? '...' : ''}`;
        type = 'custom';
    } else {
        let types = [];
        if (lowercase) types.push('kichik harflar');
        if (uppercase) types.push('katta harflar');
        if (digits) types.push('raqamlar');
        if (special) types.push('maxsus belgilar');
        description = `${length} belgili, ${types.join(', ')}`;
        type = 'standard';
    }

    // Backendga so'rov yuborish
    try {
        const response = await apiRequest('/api/generate', 'POST', {
            lowercase,
            uppercase,
            digits,
            special,
            length,
            mask,
            customWords,
            limit
        });

        if (response.error) {
            // Agar serverdan xato xabari kelsa (masalan, autentifikatsiya muammosi)
            resultDiv.innerHTML = `<p class="text-danger">${response.error}</p>`;
            document.getElementById('exportBtn').disabled = true;
            return;
        }

        allPasswords = response.passwords;

        // Natijalarni ko'rsatish
        displayPasswords(allPasswords);
        document.getElementById('exportBtn').disabled = allPasswords.length === 0;

        // Backendga saqlash (tarixni serverda saqlash)
        if (allPasswords.length) {
            await apiRequest('/history/api/history', 'POST', {
                description,
                type,
                passwords: allPasswords
            });
        }
    } catch (error) {
        resultDiv.innerHTML = `<p class="text-danger">Xatolik yuz berdi: ${error.message}</p>`;
        document.getElementById('exportBtn').disabled = true;
    }
});

// Qidiruv/Filtrlash
document.getElementById('search')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    displayPasswords(allPasswords, query);
});

// Eksport qilish
document.getElementById('exportBtn')?.addEventListener('click', () => {
    if (allPasswords.length === 0) return;

    const text = allPasswords.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'passwords.txt';
    a.click();
    window.URL.revokeObjectURL(url);
});

// Natijalarni ko'rsatish
function displayPasswords(passwords, query = '') {
    const resultDiv = document.getElementById('result');
    let filtered = passwords;
    if (query) {
        filtered = passwords.filter(pwd => pwd.toLowerCase().includes(query));
    }

    if (filtered.length) {
        resultDiv.innerHTML = filtered.map(pwd => `
            <div class="d-flex justify-content-between align-items-center">
                <span>${pwd}</span>
                <button class="btn btn-sm btn-outline-secondary copy-btn">Nusxa olish</button>
            </div>
        `).join('');
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(btn.previousElementSibling.textContent);
                alert('Parol nusxa olindi!');
            });
        });
    } else {
        resultDiv.innerHTML = '<p class="text-muted">Parollar topilmadi.</p>';
    }
}