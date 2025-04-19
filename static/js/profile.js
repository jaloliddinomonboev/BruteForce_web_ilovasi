document.addEventListener('DOMContentLoaded', () => {
    // Profil rasmini oldindan ko'rish
    const profileImageInput = document.getElementById('profileImage');
    if (profileImageInput) {
        profileImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const preview = document.getElementById('profileImagePreview');
                    if (preview) {
                        preview.src = event.target.result;
                    } else {
                        console.error('profileImagePreview elementi topilmadi!');
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    } else {
        console.error('profileImage elementi topilmadi!');
    }

    // Forma jo‘natishni serverga qoldiramiz, localStorage o‘chirildi
    // Parolni o'zgartirish va profilni tahrirlash server tomonida qayta ishlanadi
});