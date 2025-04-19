async function displayHistory(filter = '', filterType = 'all') {
    const historyTable = document.getElementById('historyTable');
    const noHistory = document.getElementById('noHistory');
    const params = new URLSearchParams({ filter, type: filterType });
    const history = await apiRequest(`/history/api/history?${params}`);

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
                <button class="btn btn-sm btn-outline-primary download-btn" data-id="${item.id}">Yuklash</button>
                <button class="btn btn-sm btn-warning edit-btn" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#editPasswordsModal">Tahrirlash</button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}">O‘chirish</button>
            </td>
        </tr>
    `).join('');
}

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

    async function sortHistory() {
        let history = await apiRequest(`/history/api/history?sort=${sortField}&direction=${sortDirection}`);
        displayHISTORY(history);
        updateSortIcons();
    }

    displayHistory();

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

    document.getElementById('filterInput')?.addEventListener('input', () => {
        displayHistory(document.getElementById('filterInput').value, document.getElementById('filterType').value);
    });

    document.getElementById('filterType')?.addEventListener('change', () => {
        displayHistory(document.getElementById('filterInput').value, document.getElementById('filterType').value);
    });

    document.getElementById('historyTable').addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (!id) return;

        if (e.target.classList.contains('view-btn')) {
            const history = await apiRequest(`/history/api/history`);
            const item = history.find(h => h.id == id);
            if (item) {
                const modalList = document.getElementById('modalPasswordList');
                modalList.innerHTML = item.passwords.map(pwd => `<div>${pwd}</div>`).join('');
            }
        } else if (e.target.classList.contains('download-btn')) {
            window.location.href = `/history/api/history/${id}/download`;
        } else if (e.target.classList.contains('edit-btn')) {
            const history = await apiRequest(`/history/api/history`);
            const item = history.find(h => h.id == id);
            if (item) {
                document.getElementById('editDescription').value = item.description;
                document.getElementById('editPasswords').value = item.passwords.join('\n');
                document.getElementById('editId').value = id;
            }
        } else if (e.target.classList.contains('delete-btn')) {
            if (confirm('Bu ro‘yxatni o‘chirishni xohlaysizmi?')) {
                await apiRequest(`/history/api/history/${id}`, 'DELETE');
                displayHistory(document.getElementById('filterInput')?.value || '', document.getElementById('filterType')?.value || 'all');
            }
        }
    });

    document.getElementById('editHistoryForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editId').value;
        const description = document.getElementById('editDescription').value;
        const passwords = document.getElementById('editPasswords').value.trim().split('\n').filter(pwd => pwd.trim());

        await apiRequest(`/history/api/history/${id}`, 'PUT', {
            description,
            passwords
        });
        displayHistory(document.getElementById('filterInput')?.value || '', document.getElementById('filterType')?.value || 'all');
        closeModal('editPasswordsModal');
    });
}


