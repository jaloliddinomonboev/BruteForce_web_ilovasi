async function apiRequest(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || ''
        }
    };
    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    // Agar javob JSON bo'lmasa, xato qaytar
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
            if (text.includes('login')) {
                throw new Error('Iltimos, avval tizimga kiring!');
            }
            throw new Error('Server HTML javob qaytardi, JSON kutilgan edi.');
        }
        throw new Error('Noma’lum xato: Server JSON javob qaytarmadi.');
    }

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Serverda xato yuz berdi');
    }
    return result;
}