// Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.MainButton.textColor = '#FFFFFF';
tg.MainButton.color = '#7c3aed';

const API_URL = '/api';

// Language detection
// Language detection
const getUserLanguage = () => {
    // 1. Try Browser Language (Priority #1)
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang) return browserLang.split('-')[0];

    // 2. Try Telegram User Object
    if (tg.initDataUnsafe?.user?.language_code) return tg.initDataUnsafe.user.language_code;

    // 3. Try Telegram API
    if (tg.languageCode) return tg.languageCode;

    return 'en';
};

const userLang = getUserLanguage();
const currentLang = ['ru', 'en', 'pl'].includes(userLang) ? userLang : 'en';

// Translations
const translations = {
    ru: {
        activeGatherings: 'Активные сборы', loading: 'Загрузка...',
        createGathering: '✨ Создать сбор', editGathering: '✏️ Редактировать сбор', title: 'Название', time: 'Время', description: 'Описание',
        addPhoto: 'Добавить фото (макс 3)', addingPhoto: 'Добавляем фото', maxPhotos: 'Максимум 3 фото', createButton: 'Создать сбор',
        saveButton: 'Сохранить изменения', edit: 'Редактировать', delete: 'Удалить', deleteConfirm: 'Удалить этот сбор?',
        deleted: 'Сбор удален', created: 'Сбор создан! 🎉', updated: 'Сбор обновлен! ✅', error: 'Ошибка', commentsSoon: 'Комментарии скоро! 💬',
        noGatherings: 'Пока нет сборов', createFirst: 'Создай первый и позови друзей! 🎉',
        justNow: 'только что', minutesAgo: 'мин назад', hoursAgo: 'ч назад', daysAgo: 'дн назад',
        comments: 'Комментарии', writeComment: 'Написать комментарий...', send: 'Отправить',
        titlePlaceholder: 'Снежки, Мафия, Фильм...', timePlaceholder: 'Сегодня в 21:30', descPlaceholder: 'Место встречи, детали...'
    },
    en: {
        activeGatherings: 'Active Gatherings', loading: 'Loading...',
        createGathering: '✨ Create Gathering', editGathering: '✏️ Edit Gathering', title: 'Title', time: 'Time', description: 'Description',
        addPhoto: 'Add photo (max 3)', addingPhoto: 'Adding photo', maxPhotos: 'Maximum 3 photos', createButton: 'Create Gathering',
        saveButton: 'Save Changes', edit: 'Edit', delete: 'Delete', deleteConfirm: 'Delete this gathering?',
        deleted: 'Gathering deleted', created: 'Gathering created! 🎉', updated: 'Gathering updated! ✅', error: 'Error', commentsSoon: 'Comments coming soon! 💬',
        noGatherings: 'No gatherings yet', createFirst: 'Create the first one and invite friends! 🎉',
        justNow: 'just now', minutesAgo: 'min ago', hoursAgo: 'h ago', daysAgo: 'd ago',
        comments: 'Comments', writeComment: 'Write a comment...', send: 'Send',
        titlePlaceholder: 'Snowball fight, Mafia, Movie...', timePlaceholder: 'Today at 21:30', descPlaceholder: 'Meeting place, details...'
    },
    pl: {
        activeGatherings: 'Aktywne Spotkania', loading: 'Ładowanie...',
        createGathering: '✨ Utwórz Spotkanie', editGathering: '✏️ Edytuj Spotkanie', title: 'Tytuł', time: 'Czas', description: 'Opis',
        addPhoto: 'Dodaj zdjęcie (maks 3)', addingPhoto: 'Dodajemy zdjęcie', maxPhotos: 'Maksymalnie 3 zdjęcia', createButton: 'Utwórz Spotkanie',
        saveButton: 'Zapisz Zmiany', edit: 'Edytuj', delete: 'Usuń', deleteConfirm: 'Usunąć to spotkanie?',
        deleted: 'Spotkanie usunięte', created: 'Spotkanie utworzone! 🎉', updated: 'Spotkanie zaktualizowane! ✅', error: 'Błąd', commentsSoon: 'Komentarze wkrótce! 💬',
        noGatherings: 'Brak spotkań', createFirst: 'Utwórz pierwsze i zaproś znajomych! 🎉',
        justNow: 'teraz', minutesAgo: 'min temu', hoursAgo: 'godz temu', daysAgo: 'dni temu',
        comments: 'Komentarze', writeComment: 'Napisz komentarz...', send: 'Wyślij',
        titlePlaceholder: 'Bitwa na śnieżki, Mafia, Film...', timePlaceholder: 'Dzisiaj o 21:30', descPlaceholder: 'Miejsce spotkania, szczegóły...'
    }
};

let t = translations[currentLang]; // Initial translation object

function updateInterface() {
    const lang = currentUser.language_code || 'en';
    t = translations[lang] || translations['en']; // Update global t object

    // Update static elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });

    // Update dynamic elements if they exist (re-render)
    if (document.getElementById('gatherings-list').children.length > 0) {
        // We might want to reload gatherings to update relative times and labels
        // But for now, let's just update the interface text
    }
}

// FOR TESTING: Use 'test_user_123' if on localhost and not in Telegram
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const fallbackId = isLocalhost ? 'test_user_123' : 'guest';
const fallbackName = isLocalhost ? 'Test User' : 'Guest';

let currentUser = {
    id: tg.initDataUnsafe?.user?.id || fallbackId,
    username: tg.initDataUnsafe?.user?.username || fallbackName,
    first_name: tg.initDataUnsafe?.user?.first_name || fallbackName,
    photo_url: tg.initDataUnsafe?.user?.photo_url || '',
    language_code: getUserLanguage()
};

// Listen for browser language changes
window.addEventListener('languagechange', () => {
    console.log('🌐 Browser language changed!');
    const newLang = getUserLanguage();

    if (newLang !== currentUser.language_code) {
        console.log(`🔄 Updating language from ${currentUser.language_code} to ${newLang}`);
        currentUser.language_code = newLang;
        updateInterface();
        syncUserData();
    }
});

// Sync user data with server on page load (updates language in DB)
// Sync user data with server on page load (updates language in DB)
async function syncUserData() {
    console.log('🔄 Syncing user data...', currentUser);

    if (currentUser.id === 'guest') {
        console.warn('⚠️ Sync skipped: User is "guest". Open in Telegram to sync with DB.');
        return;
    }

    try {
        await fetch(`${API_URL}/user/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: currentUser.id,
                username: currentUser.username,
                first_name: currentUser.first_name,
                photo_url: currentUser.photo_url,
                language_code: currentUser.language_code
            })
        });
        console.log('✅ User synced');
        updateInterface(); // Ensure UI matches synced language
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

// Sync on page load
syncUserData();

// Icons
const iconHeart = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
const iconHeartFilled = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
const iconComment = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
const iconClock = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`;
const iconUsers = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`;
const iconMoreVert = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>`;
const iconEdit = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
const iconDelete = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
const iconTranslate = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 8 6 6"></path><path d="m4 14 6-6 2-3"></path><path d="M2 5h12"></path><path d="M7 2h1"></path><path d="m22 22-5-10-5 10"></path><path d="M14 18h6"></path></svg>`;

let selectedImages = [];
let editingGatheringId = null;
let currentCommentsGatheringId = null;

async function loadGatherings() {
    try {
        const response = await fetch(`${API_URL}/gatherings`, { headers: { 'x-user-id': currentUser.id } });
        const result = await response.json();
        const container = document.getElementById('gatherings-list');
        container.innerHTML = '';

        if (result.data.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">${iconUsers}</div><div class="empty-state-text">${t.noGatherings}</div><div class="empty-state-subtext">${t.createFirst}</div></div>`;
            return;
        }

        result.data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            const timeAgo = getTimeAgo(item.created_at);
            const isLiked = item.user_liked == 1;
            const isOwner = item.user_id == currentUser.id;

            let avatarHTML = item.user_photo ? `<img src="${item.user_photo}" class="post-avatar-img" alt="${esc(item.first_name || item.created_by)}">` : `<div class="post-avatar">${getInitials(item.first_name || item.created_by)}</div>`;

            let imagesHTML = '';
            if (item.image_url) {
                try {
                    const images = JSON.parse(item.image_url);
                    if (Array.isArray(images) && images.length > 0) {
                        imagesHTML = `<div class="post-images-carousel" data-carousel-id="${item.id}"><div class="post-images-slider">${images.map(img => `<img src="${img}" class="post-image" alt="Post">`).join('')}</div>${images.length > 1 ? `<button class="carousel-nav prev">‹</button><button class="carousel-nav next">›</button><div class="carousel-dots">${images.map((_, i) => `<div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}</div>` : ''}</div>`;
                    }
                } catch (e) {
                    if (item.image_url) imagesHTML = `<div class="post-images-carousel"><div class="post-images-slider"><img src="${item.image_url}" class="post-image" alt="Post"></div></div>`;
                }
            }

            card.innerHTML = `
                <div class="card-header">
                    ${avatarHTML}
                    <div class="post-user-info">
                        <div class="post-username">${esc(item.first_name || item.created_by)}</div>
                        <div class="post-timestamp">${timeAgo}</div>
                    </div>
                    ${isOwner ? `<div class="post-menu"><button class="menu-btn" data-id="${item.id}">${iconMoreVert}</button><div class="menu-dropdown" id="menu-${item.id}"><button class="menu-item edit-btn" data-id="${item.id}">${iconEdit}<span>${t.edit}</span></button><button class="menu-item delete-btn" data-id="${item.id}">${iconDelete}<span>${t.delete}</span></button></div></div>` : ''}
                </div>
                ${imagesHTML}
                <div class="card-title">${esc(item.title)}</div>
                <div class="card-time">${iconClock} ${esc(item.time)}</div>
                <div class="card-desc" data-original="${esc(item.description)}" data-id="${item.id}">${esc(item.description)}</div>
                <div class="card-footer">
                    <div class="post-actions">
                        <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-id="${item.id}">${isLiked ? iconHeartFilled : iconHeart}<span class="like-count">${item.likes_count || 0}</span></button>
                        <button class="action-btn comment-btn" data-id="${item.id}">${iconComment}<span class="comment-count">${item.comments_count || 0}</span></button>
                        <button class="action-btn translate-btn" data-id="${item.id}" title="${t.edit}">${iconTranslate}</button>
                    </div>
                    <div class="post-meta">${new Date(item.created_at).toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : currentLang === 'pl' ? 'pl-PL' : 'en-US', { day: 'numeric', month: 'short' })}</div>
                </div>
            `;

            card.querySelector('.like-btn').onclick = () => toggleLike(item.id, card.querySelector('.like-btn'));
            card.querySelector('.comment-btn').onclick = () => openCommentsModal(item.id);
            card.querySelector('.translate-btn').onclick = () => translateDescription(item.id);

            if (isOwner) {
                card.querySelector('.menu-btn').onclick = (e) => { e.stopPropagation(); toggleMenu(item.id); };
                card.querySelector('.edit-btn').onclick = () => { closeAllMenus(); openEditModal(item); };
                card.querySelector('.delete-btn').onclick = () => { closeAllMenus(); deleteGathering(item.id); };
            }

            container.appendChild(card);
            const carousel = card.querySelector('.post-images-carousel');
            if (carousel) initCarousel(carousel);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

function toggleMenu(id) { closeAllMenus(); const menu = document.getElementById(`menu-${id}`); if (menu) menu.classList.toggle('active'); }
function closeAllMenus() { document.querySelectorAll('.menu-dropdown').forEach(menu => menu.classList.remove('active')); }

async function translateDescription(postId) {
    const descEl = document.querySelector(`.card-desc[data-id="${postId}"]`);
    if (!descEl) return;
    const originalText = descEl.getAttribute('data-original');
    const currentText = descEl.textContent;
    if (currentText !== originalText) { descEl.textContent = originalText; return; }
    try {
        const targetLang = currentUser.language_code || 'en';
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(originalText)}`);
        const data = await response.json();
        if (data && data[0] && data[0][0]) descEl.textContent = data[0].map(item => item[0]).join('');
    } catch (error) {
        console.error('Translation error:', error);
        tg.showAlert(t.error);
    }
}

function openEditModal(item) {
    editingGatheringId = item.id;
    let images = [];
    try { images = JSON.parse(item.image_url) || []; } catch (e) { if (item.image_url) images = [item.image_url]; }
    selectedImages = images;
    document.getElementById('g-title').value = item.title;
    document.getElementById('g-time').value = item.time;
    document.getElementById('g-desc').value = item.description;
    document.querySelector('.modal-title').textContent = t.editGathering;
    document.querySelector('#gathering-form button[type="submit"]').innerHTML = `${iconEdit} ${t.saveButton}`;
    updateImagesPreview();
    openModal('gathering-modal');
}

async function deleteGathering(id) {
    if (!confirm(t.deleteConfirm)) return;
    try {
        const response = await fetch(`${API_URL}/gatherings/${id}`, {
            method: 'DELETE',
            headers: {
                'x-user-id': currentUser.id,
                'x-telegram-init-data': tg.initData
            }
        });
        if (response.ok) { loadGatherings(); tg.showAlert(t.deleted); } else { tg.showAlert(t.error); }
    } catch (error) {
        console.error('Delete error:', error);
        tg.showAlert(t.error);
    }
}

function initCarousel(carousel) {
    const slider = carousel.querySelector('.post-images-slider');
    const images = slider.querySelectorAll('.post-image');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const prevBtn = carousel.querySelector('.carousel-nav.prev');
    const nextBtn = carousel.querySelector('.carousel-nav.next');
    if (images.length <= 1) return;
    let currentIndex = 0, startX = 0, isDragging = false;
    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, images.length - 1));
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }
    if (prevBtn) prevBtn.onclick = () => goToSlide(currentIndex - 1);
    if (nextBtn) nextBtn.onclick = () => goToSlide(currentIndex + 1);
    dots.forEach((dot, index) => dot.onclick = () => goToSlide(index));
    carousel.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; isDragging = true; });
    carousel.addEventListener('touchmove', (e) => { if (!isDragging) return; e.preventDefault(); }, { passive: false });
    carousel.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) goToSlide(currentIndex + (diff > 0 ? 1 : -1));
    });
}

async function toggleLike(postId, button) {
    try {
        const response = await fetch(`${API_URL}/gatherings/${postId}/like`, { method: 'POST', headers: { 'x-user-id': currentUser.id } });
        if (response.ok) {
            const result = await response.json();
            const likeCountEl = button.querySelector('.like-count');
            let count = parseInt(likeCountEl.textContent);
            if (result.message === 'liked') {
                button.classList.add('liked');
                button.innerHTML = `${iconHeartFilled}<span class="like-count">${count + 1}</span>`;
            } else {
                button.classList.remove('liked');
                button.innerHTML = `${iconHeart}<span class="like-count">${count - 1}</span>`;
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return t.justNow;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} ${t.minutesAgo}`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ${t.hoursAgo}`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ${t.daysAgo}`;
    return date.toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : currentLang === 'pl' ? 'pl-PL' : 'en-US', { day: 'numeric', month: 'short' });
}

async function createGathering(e) {
    e.preventDefault();
    const title = document.getElementById('g-title').value;
    const time = document.getElementById('g-time').value;
    const desc = document.getElementById('g-desc').value;
    if (!title || !time) return;
    tg.MainButton.showProgress();
    try {
        const url = editingGatheringId ? `${API_URL}/gatherings/${editingGatheringId}` : `${API_URL}/gatherings`;
        const method = editingGatheringId ? 'PUT' : 'POST';
        const body = editingGatheringId ? { title, time, description: desc, image_url: selectedImages.length > 0 ? JSON.stringify(selectedImages) : '' } : { title, time, description: desc, created_by: currentUser.username, user_id: currentUser.id, first_name: currentUser.first_name, user_photo: currentUser.photo_url, image_url: selectedImages.length > 0 ? JSON.stringify(selectedImages) : '' };
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.id,
                'x-telegram-init-data': tg.initData
            },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            closeModal('gathering-modal');
            document.getElementById('gathering-form').reset();
            removeAllImages();
            editingGatheringId = null;
            document.querySelector('.modal-title').textContent = t.createGathering;
            document.querySelector('#gathering-form button[type="submit"]').innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px;"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> ${t.createButton}`;
            loadGatherings();
            tg.showAlert(editingGatheringId ? t.updated : t.created);
        }
    } catch (error) {
        tg.showAlert(t.error);
    } finally {
        tg.MainButton.hideProgress();
    }
}

function handleImageSelect() {
    const input = document.getElementById('g-image');
    if (input.files && input.files.length > 0) {
        const filesToAdd = Math.min(input.files.length, 3 - selectedImages.length);
        for (let i = 0; i < filesToAdd; i++) {
            const file = input.files[i];
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width, height = img.height;
                    const maxSize = 1200;
                    if (width > height) { if (width > maxSize) { height *= maxSize / width; width = maxSize; } }
                    else { if (height > maxSize) { width *= maxSize / height; height = maxSize; } }
                    canvas.width = width;
                    canvas.height = height;
                    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                    selectedImages.push(canvas.toDataURL('image/jpeg', 0.7));
                    updateImagesPreview();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
    input.value = '';
}

function updateImagesPreview() {
    const container = document.getElementById('images-preview-container');
    const grid = document.getElementById('images-grid');
    const uploadBtn = document.getElementById('btn-select-image');
    const uploadBtnText = document.getElementById('upload-btn-text');
    grid.innerHTML = '';
    selectedImages.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'image-preview-item';
        item.innerHTML = `<img src="${img}" alt="Preview"><button type="button" class="remove-image-btn" data-index="${index}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>`;
        item.querySelector('.remove-image-btn').onclick = () => removeImage(index);
        grid.appendChild(item);
    });
    if (selectedImages.length > 0) {
        container.style.display = 'block';
        uploadBtnText.textContent = selectedImages.length >= 3 ? t.maxPhotos : `${t.addingPhoto} (${selectedImages.length}/3)`;
        uploadBtn.disabled = selectedImages.length >= 3;
        uploadBtn.style.opacity = selectedImages.length >= 3 ? '0.5' : '1';
        uploadBtn.style.cursor = selectedImages.length >= 3 ? 'not-allowed' : 'pointer';
    } else {
        container.style.display = 'none';
        uploadBtnText.textContent = t.addPhoto;
        uploadBtn.disabled = false;
        uploadBtn.style.opacity = '1';
        uploadBtn.style.cursor = 'pointer';
    }
}

function removeImage(index) { selectedImages.splice(index, 1); updateImagesPreview(); }
function removeAllImages() { selectedImages = []; updateImagesPreview(); }
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    if (id === 'gathering-modal') {
        removeAllImages();
        editingGatheringId = null;
        document.getElementById('gathering-form').reset();
        document.querySelector('.modal-title').textContent = t.createGathering;
        document.querySelector('#gathering-form button[type="submit"]').innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px;"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> ${t.createButton}`;
    }
}
function esc(text) { if (!text) return ''; return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }

document.addEventListener('DOMContentLoaded', () => {
    loadGatherings();
    document.getElementById('fab-create').onclick = () => openModal('gathering-modal');
    document.querySelectorAll('.close-modal').forEach(btn => btn.onclick = () => closeModal('gathering-modal'));
    document.getElementById('gathering-form').onsubmit = createGathering;
    document.getElementById('g-image').onchange = handleImageSelect;
    document.getElementById('btn-select-image').onclick = () => document.getElementById('g-image').click();
    document.getElementById('gathering-modal').onclick = (e) => { if (e.target.id === 'gathering-modal') closeModal('gathering-modal'); };
    document.addEventListener('click', (e) => { if (!e.target.closest('.post-menu')) closeAllMenus(); });

    // Comments Events
    document.getElementById('close-comments').onclick = () => closeModal('comments-modal');
    document.getElementById('comments-modal').onclick = (e) => { if (e.target.id === 'comments-modal') closeModal('comments-modal'); };
    document.getElementById('comment-form').onsubmit = postComment;
});

// --- Comments Logic ---

function openCommentsModal(gatheringId) {
    currentCommentsGatheringId = gatheringId;
    document.getElementById('comments-modal').classList.add('active');
    document.querySelector('#comments-modal .modal-title').textContent = t.comments;
    document.getElementById('comment-input').placeholder = t.writeComment;
    loadComments(gatheringId);
}

async function loadComments(gatheringId) {
    const list = document.getElementById('comments-list');
    list.innerHTML = '<div class="loader"></div>';

    try {
        const response = await fetch(`${API_URL}/gatherings/${gatheringId}/comments`);
        const result = await response.json();
        renderComments(result.data);
    } catch (error) {
        console.error('Error loading comments:', error);
        list.innerHTML = `<div style="text-align:center;color:red;">${t.error}</div>`;
    }
}

function renderComments(comments) {
    const list = document.getElementById('comments-list');
    list.innerHTML = '';

    if (comments.length === 0) {
        list.innerHTML = `<div style="text-align:center;padding:20px;color:#9ca3af;">${t.writeComment}</div>`;
        return;
    }

    comments.forEach(comment => {
        const isOwn = String(comment.user_id) === String(currentUser.id);
        const item = document.createElement('div');
        item.className = `comment-item ${isOwn ? 'own' : ''}`;

        const avatar = comment.photo_url
            ? `<img src="${comment.photo_url}" class="comment-avatar">`
            : `<div class="comment-avatar-placeholder">${getInitials(comment.first_name || comment.username)}</div>`;

        const actionsHtml = `
            <div class="comment-actions">
                <button class="comment-action-btn" onclick="translateComment(this, '${esc(comment.comment)}')" title="Translate">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8l6 6M5 8l6-6M5 8h14M19 16l-6 6M19 16l-6-6M19 16H5"/></svg>
                </button>
                ${isOwn ? `
                <button class="comment-action-btn" onclick="editComment(${comment.id}, '${esc(comment.comment)}')" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="comment-action-btn" onclick="deleteComment(${comment.id})" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
                ` : ''}
            </div>
        `;

        item.innerHTML = `
            ${avatar}
            <div class="comment-bubble">
                <div class="comment-author">${esc(comment.first_name || comment.username)}</div>
                <div class="comment-text" id="comment-text-${comment.id}">${esc(comment.comment)}</div>
                ${actionsHtml}
                <div class="comment-time">${getTimeAgo(comment.created_at)}</div>
            </div>
        `;
        list.appendChild(item);
    });

    // Scroll to bottom
    list.scrollTop = list.scrollHeight;
}

async function deleteComment(commentId) {
    if (!confirm(t.deleteConfirm)) return;
    try {
        const response = await fetch(`${API_URL}/gathering-comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'x-user-id': currentUser.id }
        });
        if (response.ok) {
            loadComments(currentCommentsGatheringId);
            const countEl = document.querySelector(`.comment-btn[data-id="${currentCommentsGatheringId}"] .comment-count`);
            if (countEl) countEl.textContent = Math.max(0, parseInt(countEl.textContent || 0) - 1);
        } else {
            tg.showAlert(t.error);
        }
    } catch (error) {
        console.error('Delete comment error:', error);
    }
}

async function editComment(commentId, oldText) {
    const newText = prompt(t.edit, oldText);
    if (newText === null || newText === oldText) return;
    if (!newText.trim()) return;

    try {
        const response = await fetch(`${API_URL}/gathering-comments/${commentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.id
            },
            body: JSON.stringify({ comment: newText })
        });
        if (response.ok) {
            loadComments(currentCommentsGatheringId);
        } else {
            tg.showAlert(t.error);
        }
    } catch (error) {
        console.error('Edit comment error:', error);
    }
}

async function translateComment(btn, text) {
    try {
        const targetLang = currentUser.language_code || 'en';
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
        const data = await response.json();
        if (data && data[0] && data[0][0]) {
            const translatedText = data[0].map(item => item[0]).join('');
            // Find the text element relative to the button
            const bubble = btn.closest('.comment-bubble');
            const textEl = bubble.querySelector('.comment-text');
            textEl.textContent = translatedText;
            textEl.style.fontStyle = 'italic';
        }
    } catch (error) {
        console.error('Translate error:', error);
        tg.showAlert(t.error);
    }
}

async function postComment(e) {
    e.preventDefault();
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text || !currentCommentsGatheringId) return;

    try {
        const response = await fetch(`${API_URL}/gatherings/${currentCommentsGatheringId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.id
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                username: currentUser.username,
                first_name: currentUser.first_name,
                photo_url: currentUser.photo_url,
                comment: text
            })
        });

        if (response.ok) {
            input.value = '';
            loadComments(currentCommentsGatheringId);

            // Update count in background
            const countEl = document.querySelector(`.comment-btn[data-id="${currentCommentsGatheringId}"] .comment-count`);
            if (countEl) {
                countEl.textContent = parseInt(countEl.textContent || 0) + 1;
            }
        } else {
            tg.showAlert(t.error);
        }
    } catch (error) {
        console.error('Post comment error:', error);
        tg.showAlert(t.error);
    }
}
