// Login formasi
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Login ma’lumotlari:', { email, password });
    alert('Kirish so‘rovi yuborildi! Backend ulanganda ishlaydi.');
});

// Register formasi
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Ro‘yxatdan o‘tish ma’lumotlari:', { name, email, password });
    alert('Ro‘yxatdan o‘tish so‘rovi yuborildi! Backend ulanganda ishlaydi.');
});

// Profilni tahrirlash formasi
document.getElementById('editProfileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const profileImage = document.getElementById('profileImage').files[0];

    console.log('Tahrirlangan profil ma’lumotlari:', { name, email, profileImage: profileImage ? profileImage.name : 'Rasm tanlanmadi' });
    alert('Ma’lumotlar saqlash so‘rovi yuborildi! Backend ulanganda ishlaydi.');
});

// Profil rasmini oldindan ko'rish
document.getElementById('profileImage')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('profileImagePreview').src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Parolni o'zgartirish formasi
document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert('Yangi parol va tasdiqlash mos kelmadi!');
        return;
    }

    console.log('Parol o’zgartirish ma’lumotlari:', { currentPassword, newPassword });
    alert('Parol yangilash so‘rovi yuborildi! Backend ulanganda ishlaydi.');
});

// Parol generatsiya formasi
let allPasswords = [];

document.getElementById('generateForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    // Forma ma'lumotlarini olish
    const lowercase = document.getElementById('lowercase').checked;
    const uppercase = document.getElementById('uppercase').checked;
    const digits = document.getElementById('digits').checked;
    const special = document.getElementById('special').checked;
    const length = parseInt(document.getElementById('length').value);
    const mask = document.getElementById('mask').value.trim();
    const customWords = document.getElementById('customWords').value.trim().split('\n').filter(word => word.trim());

    // Belgilar to'plamini shakllantirish
    let chars = '';
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (digits) chars += '0123456789';
    if (special) chars += '!@#$%^&*()';

    // Natijalar maydoni
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    allPasswords = [];

    // Agar hech narsa tanlanmagan bo'lsa
    if (!chars && !mask && !customWords.length) {
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
        description = `${length} belgili, ${types.join.viewer(', ')}`;
        type = 'standard';
    }

    // Generatsiya qilish
    if (mask) {
        allPasswords = generateByMask(mask);
    } else {
        if (customWords.length) {
            allPasswords = allPasswords.concat(customWords);
            if (chars) {
                customWords.forEach(word => {
                    for (let i = 1; i <= 3; i++) {
                        allPasswords.push(word + generateRandomString(chars, i));
                    }
                });
            }
        }
        if (chars && length <= 5) {
            allPasswords = allPasswords.concat(generateCombinations(chars, length));
        } else if (chars) {
            for (let i = 0; i < 10; i++) {
                allPasswords.push(generateRandomString(chars, length));
            }
        }
    }

    // Natijalarni ko'rsatish
    displayPasswords(allPasswords);
    document.getElementById('exportBtn').disabled = allPasswords.length === 0;

    // localStorage'ga saqlash
    if (allPasswords.length) {
        const history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        history.push({
            id: Date.now(),
            date: new Date().toLocaleString(),
            description,
            type,
            count: allPasswords.length,
            passwords: allPasswords
        });
        localStorage.setItem('passwordHistory', JSON.stringify(history));
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

// Tasodifiy parol yaratish
function generateRandomString(chars, length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

// Kombinatsiyalarni generatsiya qilish
function generateCombinations(chars, length) {
    let result = [''];
    for (let i = 0; i < length; i++) {
        let newResult = [];
        for (let prefix of result) {
            for (let char of chars) {
                newResult.push(prefix + char);
            }
        }
        result = newResult;
    }
    return result;
}

// Maska bo'yicha generatsiya
function generateByMask(mask) {
    const charSets = {
        '?l': 'abcdefghijklmnopqrstuvwxyz',
        '?u': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '?d': '0123456789',
        '?s': '!@#$%^&*()'
    };

    let parts = [];
    let current = '';
    for (let char of mask) {
        if (char === '?' && current === '') {
            current = char;
        } else if (current === '?' && ['l', 'u', 'd', 's'].includes(char)) {
            parts.push(charSets['?' + char] || '');
            current = '';
        } else {
            parts.push(char);
            current = '';
        }
    }

    let result = [''];
    for (let part of parts) {
        let newResult = [];
        for (let prefix of result) {
            if (part.length === 1) {
                newResult.push(prefix + part);
            } else {
                for (let char of part) {
                    newResult.push(prefix + char);
                }
            }
        }
        result = newResult;
    }
    return result;
}

// Natijalarni ko'rsatish
function displayPasswords(passwords, query = '') {
    const resultDiv = document.getElementById('result');
    let filtered = passwords;
    if (query) {
        filtered = passwords.filter(pwd => pwd.toLowerCase().includes(query));
    }

    if (filtered.length) {
        resultDiv.innerHTML = filtered.map(pwd => `<div>${pwd}</div>`).join('');
    } else {
        resultDiv.innerHTML = '<p class="text-muted">Parollar topilmadi.</p>';
    }
}

// Tarixni ko'rsatish
function displayHistory(filter = '', filterType = 'all') {
    const historyTable = document.getElementById('historyTable');
    const noHistory = document.getElementById('noHistory');
    let history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');

    // Filtrlash
    if (filter || filterType !== 'all') {
        history = history.filter(item => {
            const matchesFilter = filter ? item.description.toLowerCase().includes(filter.toLowerCase()) : true;
            const matchesType = filterType === 'all' ? true : item.type === filterType;
            return matchesFilter && matchesType;
        });
    }

    if (history.length === 0) {
        noHistory.classList.remove('d-none');
        historyTable.innerHTML = '';
        return;
    }

    noHistory.classList.add('d-none');
    historyTable.innerHTML = history.map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.description}</td>
            <td>${item.count}</td>
            <td>
                <button class="btn btn-sm btn-primary view-btn" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#viewPasswordsModal">Ko‘rish</button>
                <button class="btn btn-sm btn-outline-primary download-btn" data-id="${item.id}">Yuklab olish</button>
                <button class="btn btn-sm btn-warning edit-btn" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#editPasswordsModal">Tahrirlash</button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}">O‘chirish</button>
            </td>
        </tr>
    `).join('');
}

// Tarixni yuklash va saralash
if (document.getElementById('historyTable')) {
    let sortField = 'date';
    let sortDirection = 'desc';

    function updateSortIcons() {
        document.querySelectorAll('.sort-icon').forEach(icon => {
            icon.textContent = '';
        });
        const activeIcon = document.querySelector(`.sort[data-sort="${sortField}"] .sort-icon`);
        if (activeIcon) {
            activeIcon.textContent = sortDirection === 'asc' ? '↑' : '↓';
        }
    }

    function sortHistory() {
        let history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        history.sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];
            if (sortField === 'date') {
                valA = new Date(valA);
                valB = new Date(valB);
            }
            if (sortDirection === 'asc') {
                return valA > valB ? 1 : -1;
            } else {
                return valA < valB ? 1 : -1;
            }
        });
        localStorage.setItem('passwordHistory', JSON.stringify(history));
        displayHistory(document.getElementById('filterInput')?.value || '', document.getElementById('filterType')?.value || 'all');
        updateSortIcons();
    }

    displayHistory();

    // Saralash hodisasi
    document.querySelectorAll('.sort').forEach(th => {
        th.addEventListener('click', () => {
            const newField = th.dataset.sort;
            if (newField === sortField) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = newField;
                sortDirection = 'asc';
            }
            sortHistory();
        });
    });

    // Filtrlash hodisalari
    document.getElementById('filterInput')?.addEventListener('input', () => {
        displayHistory(document.getElementById('filterInput').value, document.getElementById('filterType').value);
    });

    document.getElementById('filterType')?.addEventListener('change', () => {
        displayHistory(document.getElementById('filterInput').value, document.getElementById('filterType').value);
    });

    // Amallar uchun delegatsiya
    document.getElementById('historyTable').addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (!id) return;

        const history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        const item = history.find(h => h.id == id);

        if (!item) return;

        if (e.target.classList.contains('view-btn')) {
            const modalList = document.getElementById('modalPasswordList');
            modalList.innerHTML = item.passwords.map(pwd => `<div>${pwd}</div>`).join('');
        } else if (e.target.classList.contains('download-btn')) {
            const text = item.passwords.join('\n');
            const blob = new Blob([text], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `passwords_${id}.txt`;
            a.click();
            window.URL.revokeObjectURL(url);
        } else if (e.target.classList.contains('edit-btn')) {
            document.getElementById('editDescription').value = item.description;
            document.getElementById('editPasswords').value = item.passwords.join('\n');
            document.getElementById('editId').value = id;
        } else if (e.target.classList.contains('delete-btn')) {
            if (confirm('Bu ro‘yxatni o‘chirishni xohlaysizmi?')) {
                const updatedHistory = history.filter(h => h.id != id);
                localStorage.setItem('passwordHistory', JSON.stringify(updatedHistory));
                displayHistory(document.getElementById('filterInput')?.value || '', document.getElementById('filterType')?.value || 'all');
            }
        }
    });

    // Tahrirlash formasi
    document.getElementById('editHistoryForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('editId').value;
        const description = document.getElementById('editDescription').value;
        const passwords = document.getElementById('editPasswords').value.trim().split('\n').filter(pwd => pwd.trim());

        let history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        const itemIndex = history.findIndex(h => h.id == id);
        if (itemIndex !== -1) {
            history[itemIndex].description = description;
            history[itemIndex].passwords = passwords;
            history[itemIndex].count = passwords.length;
            localStorage.setItem('passwordHistory', JSON.stringify(history));
            displayHistory(document.getElementById('filterInput')?.value || '', document.getElementById('filterType')?.value || 'all');
            bootstrap.Modal.getInstance(document.getElementById('editPasswordsModal')).hide();
        }
    });
}


