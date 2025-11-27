const tg = window.Telegram.WebApp;
tg.expand();
tg.MainButton.textColor = '#FFFFFF';
tg.MainButton.color = '#7c3aed';

const API_URL = '/api';

// Detect user language
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

let currentUser = {
    id: tg.initDataUnsafe?.user?.id || 'guest',
    username: tg.initDataUnsafe?.user?.username || 'Guest',
    first_name: tg.initDataUnsafe?.user?.first_name || 'Guest',
    photo_url: tg.initDataUnsafe?.user?.photo_url || null,
    language_code: getUserLanguage()
};

// Sync user data on page load
async function syncUserData() {
    if (currentUser.id === 'guest') return;

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
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

syncUserData();

// Translations
const translations = {
    ru: {
        pageTitle: 'Отзывы',
        leaveFeedback: '💡 Оставить отзыв',
        category: 'Категория',
        selectCategory: 'Выберите категорию',
        bug: '🐛 Баг',
        feature: '✨ Новая функция',
        improvement: '🔧 Улучшение',
        other: '💬 Другое',
        yourFeedback: 'Ваш отзыв',
        feedbackPlaceholder: 'Опишите вашу идею или проблему...',
        send: 'Отправить',
        allReviews: 'Все отзывы',
        noReviews: 'Пока нет отзывов',
        noComments: 'Пока нет комментариев',
        writeComment: 'Написать комментарий...',
        translate: 'Перевод',
        edit: 'Редактировать',
        delete: 'Удалить',
        editReview: 'Редактировать отзыв',
        editComment: 'Редактировать комментарий',
        save: 'Сохранить',
        deleteConfirm: 'Вы уверены, что хотите удалить этот отзыв?',
        deleteCommentConfirm: 'Удалить комментарий?',
        reviewDeleted: 'Отзыв удален',
        reviewUpdated: 'Отзыв обновлен!',
        thankYou: 'Спасибо за ваш отзыв! 💜',
        fillAllFields: 'Заполните все поля!',
        commentEmpty: 'Комментарий не может быть пустым!',
        error: 'Ошибка',
        networkError: 'Ошибка сети',
        recently: 'Недавно'
    },
    en: {
        pageTitle: 'Feedback',
        leaveFeedback: '💡 Leave Feedback',
        category: 'Category',
        selectCategory: 'Select category',
        bug: '🐛 Bug',
        feature: '✨ New Feature',
        improvement: '🔧 Improvement',
        other: '💬 Other',
        yourFeedback: 'Your Feedback',
        feedbackPlaceholder: 'Describe your idea or problem...',
        send: 'Send',
        allReviews: 'All Reviews',
        noReviews: 'No reviews yet',
        noComments: 'No comments yet',
        writeComment: 'Write a comment...',
        translate: 'Translate',
        edit: 'Edit',
        delete: 'Delete',
        editReview: 'Edit Review',
        editComment: 'Edit Comment',
        save: 'Save',
        deleteConfirm: 'Are you sure you want to delete this review?',
        deleteCommentConfirm: 'Delete comment?',
        reviewDeleted: 'Review deleted',
        reviewUpdated: 'Review updated!',
        thankYou: 'Thank you for your feedback! 💜',
        fillAllFields: 'Fill all fields!',
        commentEmpty: 'Comment cannot be empty!',
        error: 'Error',
        networkError: 'Network error',
        recently: 'Recently'
    },
    pl: {
        pageTitle: 'Opinie',
        leaveFeedback: '💡 Zostaw Opinię',
        category: 'Kategoria',
        selectCategory: 'Wybierz kategorię',
        bug: '🐛 Błąd',
        feature: '✨ Nowa Funkcja',
        improvement: '🔧 Ulepszenie',
        other: '💬 Inne',
        yourFeedback: 'Twoja Opinia',
        feedbackPlaceholder: 'Opisz swój pomysł lub problem...',
        send: 'Wyślij',
        allReviews: 'Wszystkie Opinie',
        noReviews: 'Brak opinii',
        noComments: 'Brak komentarzy',
        writeComment: 'Napisz komentarz...',
        translate: 'Przetłumacz',
        edit: 'Edytuj',
        delete: 'Usuń',
        editReview: 'Edytuj Opinię',
        editComment: 'Edytuj Komentarz',
        save: 'Zapisz',
        deleteConfirm: 'Czy na pewno chcesz usunąć tę opinię?',
        deleteCommentConfirm: 'Usunąć komentarz?',
        reviewDeleted: 'Opinia usunięta',
        reviewUpdated: 'Opinia zaktualizowana!',
        thankYou: 'Dziękujemy za opinię! 💜',
        fillAllFields: 'Wypełnij wszystkie pola!',
        commentEmpty: 'Komentarz nie może być pusty!',
        error: 'Błąd',
        networkError: 'Błąd sieci',
        recently: 'Niedawno'
    }
};

let t = translations[['ru', 'en', 'pl'].includes(currentUser.language_code) ? currentUser.language_code : 'en'];

const categoryLabels = {
    'bug': t.bug,
    'feature': t.feature,
    'improvement': t.improvement,
    'other': t.other
};

function updateInterface() {
    const lang = currentUser.language_code || 'en';
    t = translations[lang] || translations['en'];

    // Update category labels
    categoryLabels['bug'] = t.bug;
    categoryLabels['feature'] = t.feature;
    categoryLabels['improvement'] = t.improvement;
    categoryLabels['other'] = t.other;

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

    // Update custom select options
    const options = document.querySelectorAll('.custom-option');
    if (options.length > 0) {
        options[0].textContent = t.bug;
        options[1].textContent = t.feature;
        options[2].textContent = t.improvement;
        options[3].textContent = t.other;
    }

    // Update edit modal select options
    const editOptions = document.querySelectorAll('#edit-category option');
    if (editOptions.length > 0) {
        editOptions[0].textContent = t.bug;
        editOptions[1].textContent = t.feature;
        editOptions[2].textContent = t.improvement;
        editOptions[3].textContent = t.other;
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', () => {
    updateInterface();
});

// Listen for language changes
window.addEventListener('languagechange', () => {
    const newLang = getUserLanguage();
    if (newLang !== currentUser.language_code) {
        currentUser.language_code = newLang;
        updateInterface();
        syncUserData();
    }
});


let reviews = [];
let expandedReviewId = null;
let editingReviewId = null;
let editingCommentId = null;

function formatDate(dateStr) {
    if (!dateStr) return t.recently;
    const utcDate = new Date(dateStr);
    const warsawDate = new Date(utcDate.getTime() - (2 * 60 * 60 * 1000));
    const months = {
        ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        pl: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru']
    };
    const lang = currentUser.language_code || 'en';
    const monthNames = months[lang] || months['en'];
    const day = warsawDate.getUTCDate();
    const month = monthNames[warsawDate.getUTCMonth()];
    const hours = String(warsawDate.getUTCHours()).padStart(2, '0');
    const minutes = String(warsawDate.getUTCMinutes()).padStart(2, '0');
    return `${day} ${month}, ${hours}:${minutes}`;
}

async function loadReviews() {
    try {
        const response = await fetch(`${API_URL}/reviews`, {
            headers: { 'x-user-id': currentUser.id }
        });
        const result = await response.json();
        reviews = result.data;
        renderReviews();
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderReviews() {
    const list = document.getElementById('feedback-list');
    list.innerHTML = '';
    if (reviews.length === 0) {
        list.innerHTML = `<p style="text-align:center;color:#9ca3af;padding:40px;">${t.noReviews}</p>`;
        return;
    }
    reviews.forEach(review => {
        const card = createReviewCard(review);
        list.appendChild(card);
    });
}

function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.id = `review-${review.id}`;
    const date = formatDate(review.created_at);
    const avatar = review.photo_url
        ? `<img src="${review.photo_url}" class="review-avatar" alt="Avatar">`
        : `<div class="review-avatar" style="background:#e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-weight:700;">${review.first_name?.[0] || '?'}</div>`;
    const isLiked = review.user_liked === 1;
    const isOwner = String(review.user_id) === String(currentUser.id);

    let ownerActions = '';
    if (isOwner) {
        ownerActions = `
            <div class="review-owner-actions">
                <button class="icon-btn edit-btn" onclick="editReview(${review.id})" title="Редактировать">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="icon-btn delete-btn" onclick="deleteReview(${review.id})" title="Удалить">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="review-header">
            ${avatar}
            <div class="review-user-info">
                <div class="review-name">
                    ${escapeHtml(review.first_name || review.username)}
                    ${ownerActions}
                </div>
                <div class="review-meta">
                    <span class="review-category">${categoryLabels[review.category] || review.category}</span>
                    <span class="review-date">${date}</span>
                </div>
            </div>
        </div>
        <div class="review-message" id="msg-${review.id}">${escapeHtml(review.message)}</div>
        <div class="review-actions">
            <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${review.id})">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span id="likes-${review.id}">${review.likes_count || 0}</span>
            </button>
            <button class="action-btn" onclick="toggleComments(${review.id})">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span id="comments-count-${review.id}">${review.comments_count || 0}</span>
            </button>
            <button class="action-btn" onclick="translateMessage(${review.id})">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14.5 17h6.5"/>
                </svg>
                <span>${t.translate}</span>
            </button>
        </div>
        <div class="comments-section" id="comments-${review.id}" style="display:none;">
            <div class="comments-list" id="comments-list-${review.id}"></div>
            <div class="comment-form">
                <textarea id="comment-input-${review.id}" placeholder="${t.writeComment}" rows="2"></textarea>
                <button class="btn-small" onclick="submitComment(${review.id})">${t.send}</button>
            </div>
        </div>
    `;
    return card;
}

async function toggleLike(reviewId) {
    try {
        const response = await fetch(`${API_URL}/reviews/${reviewId}/like`, {
            method: 'POST',
            headers: { 'x-user-id': currentUser.id }
        });
        if (response.ok) await loadReviews();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function toggleComments(reviewId) {
    const section = document.getElementById(`comments-${reviewId}`);
    if (expandedReviewId === reviewId) {
        section.style.display = 'none';
        expandedReviewId = null;
    } else {
        if (expandedReviewId) {
            document.getElementById(`comments-${expandedReviewId}`).style.display = 'none';
        }
        section.style.display = 'block';
        expandedReviewId = reviewId;
        await loadComments(reviewId);
    }
}

async function loadComments(reviewId) {
    try {
        const response = await fetch(`${API_URL}/reviews/${reviewId}/comments`);
        const result = await response.json();
        const list = document.getElementById(`comments-list-${reviewId}`);
        list.innerHTML = '';
        if (result.data.length === 0) {
            list.innerHTML = `<p style="text-align:center;color:#9ca3af;padding:12px;">${t.noComments}</p>`;
            return;
        }
        result.data.forEach(comment => {
            const el = document.createElement('div');
            el.className = 'comment-item';
            const avatar = comment.photo_url
                ? `<img src="${comment.photo_url}" class="comment-avatar" alt="Avatar">`
                : `<div class="comment-avatar" style="background:#e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-weight:600;font-size:12px;">${comment.first_name?.[0] || '?'}</div>`;
            const date = formatDate(comment.created_at);
            const isOwner = String(comment.user_id) === String(currentUser.id);

            let actions = `
                <button class="comment-action-btn" onclick="translateComment(${comment.id})" title="Перевести">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14.5 17h6.5"/>
                    </svg>
                </button>
            `;

            if (isOwner) {
                actions += `
                    <button class="comment-action-btn edit-btn" onclick="editComment(${comment.id}, '${escapeHtml(comment.comment)}')" title="Редактировать">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="comment-action-btn delete-btn" onclick="deleteComment(${comment.id})" title="Удалить">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                `;
            }

            el.innerHTML = `
                ${avatar}
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-name">${escapeHtml(comment.first_name || comment.username)}</span>
                        <div class="comment-meta">
                            <span class="comment-date">${date}</span>
                            <div class="comment-actions">${actions}</div>
                        </div>
                    </div>
                    <div class="comment-text" id="comment-text-${comment.id}">${escapeHtml(comment.comment)}</div>
                </div>
            `;
            list.appendChild(el);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function submitComment(reviewId) {
    const input = document.getElementById(`comment-input-${reviewId}`);
    const comment = input.value.trim();
    if (!comment) return;
    try {
        const response = await fetch(`${API_URL}/reviews/${reviewId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: currentUser.id,
                username: currentUser.username,
                first_name: currentUser.first_name,
                photo_url: currentUser.photo_url,
                comment
            })
        });
        if (response.ok) {
            input.value = '';
            await loadComments(reviewId);
            await loadReviews();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function translateMessage(reviewId) {
    const msgEl = document.getElementById(`msg-${reviewId}`);
    const original = msgEl.getAttribute('data-original') || msgEl.textContent;
    if (!msgEl.getAttribute('data-original')) {
        msgEl.setAttribute('data-original', original);
    }
    if (msgEl.classList.contains('translated')) {
        msgEl.textContent = original;
        msgEl.classList.remove('translated');
        msgEl.style.fontStyle = '';
        msgEl.style.color = '';
        return;
    }
    try {
        const targetLang = currentUser.language_code || 'en';
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(original)}`);
        const data = await response.json();
        if (data && data[0] && data[0][0]) {
            const translatedText = data[0].map(item => item[0]).join('');
            msgEl.textContent = translatedText;
            msgEl.classList.add('translated');
            msgEl.style.fontStyle = 'italic';
            msgEl.style.color = '#7c3aed';
        }
    } catch (error) {
        console.error('Error:', error);
        tg.showAlert(t.error);
    }
}

async function translateComment(commentId) {
    const msgEl = document.getElementById(`comment-text-${commentId}`);
    const original = msgEl.getAttribute('data-original') || msgEl.textContent;
    if (!msgEl.getAttribute('data-original')) {
        msgEl.setAttribute('data-original', original);
    }
    if (msgEl.classList.contains('translated')) {
        msgEl.textContent = original;
        msgEl.classList.remove('translated');
        msgEl.style.fontStyle = '';
        msgEl.style.color = '';
        return;
    }
    try {
        const targetLang = currentUser.language_code || 'en';
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(original)}`);
        const data = await response.json();
        if (data && data[0] && data[0][0]) {
            const translatedText = data[0].map(item => item[0]).join('');
            msgEl.textContent = translatedText;
            msgEl.classList.add('translated');
            msgEl.style.fontStyle = 'italic';
            msgEl.style.color = '#7c3aed';
        }
    } catch (error) {
        console.error('Error:', error);
        tg.showAlert(t.error);
    }
}

async function deleteReview(reviewId) {
    if (!confirm(t.deleteConfirm)) return;

    try {
        const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: { 'x-user-id': currentUser.id }
        });

        if (response.ok) {
            tg.showAlert(t.reviewDeleted);
            loadReviews();
        } else {
            const data = await response.json();
            tg.showAlert(data.error || t.error);
        }
    } catch (error) {
        console.error('Error:', error);
        tg.showAlert(t.networkError);
    }
}

async function deleteComment(commentId) {
    if (!confirm(t.deleteCommentConfirm)) return;

    try {
        const response = await fetch(`${API_URL}/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'x-user-id': currentUser.id }
        });

        if (response.ok) {
            // Reload comments for the current expanded review
            if (expandedReviewId) {
                await loadComments(expandedReviewId);
                // Also update review count (reload reviews silently or just decrement UI)
                await loadReviews();
            }
        } else {
            tg.showAlert(t.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// --- Edit Modal Functions ---

function editReview(reviewId) {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    editingReviewId = reviewId;
    document.getElementById('edit-category').value = review.category;
    document.getElementById('edit-message').value = review.message;

    document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    editingReviewId = null;
}

async function submitEditReview() {
    if (!editingReviewId) return;

    const category = document.getElementById('edit-category').value;
    const message = document.getElementById('edit-message').value;

    if (!category || !message) {
        tg.showAlert('Заполните все поля!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/reviews/${editingReviewId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.id
            },
            body: JSON.stringify({
                category,
                message
            })
        });

        const result = await response.json();
        if (response.ok) {
            tg.showAlert(t.reviewUpdated);
            closeEditModal();
            loadReviews();
        } else {
            tg.showAlert(result.error || t.error);
        }
    } catch (error) {
        console.error('Error:', error);
        tg.showAlert(t.networkError);
    }
}

// --- Edit Comment Functions ---

function editComment(commentId, currentText) {
    editingCommentId = commentId;
    document.getElementById('edit-comment-text').value = currentText;
    document.getElementById('edit-comment-modal').style.display = 'flex';
}

function closeEditCommentModal() {
    document.getElementById('edit-comment-modal').style.display = 'none';
    editingCommentId = null;
}

async function submitEditComment() {
    if (!editingCommentId) return;

    const comment = document.getElementById('edit-comment-text').value;

    if (!comment) {
        tg.showAlert(t.commentEmpty);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/comments/${editingCommentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.id
            },
            body: JSON.stringify({ comment })
        });

        if (response.ok) {
            closeEditCommentModal();
            if (expandedReviewId) {
                await loadComments(expandedReviewId);
            }
        } else {
            tg.showAlert(t.error);
        }
    } catch (error) {
        console.error('Error:', error);
        tg.showAlert('Ошибка сети');
    }
}

// --- Submit New Review ---
async function submitReview(e) {
    e.preventDefault();
    const category = document.getElementById('f-category').value;
    const message = document.getElementById('f-message').value;
    if (!category || !message) {
        tg.showAlert('Заполните все поля!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/reviews`, {
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
                category,
                message
            })
        });

        const result = await response.json();
        if (response.ok) {
            tg.showAlert(t.thankYou);
            document.getElementById('feedback-form').reset();
            loadReviews();
        } else {
            tg.showAlert(result.error || t.error);
        }
    } catch (error) {
        console.error('Error:', error);
        tg.showAlert(t.networkError);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', () => {
    // Custom Select Logic
    const selectWrapper = document.querySelector('.custom-select-wrapper');
    const select = selectWrapper.querySelector('.custom-select');
    const trigger = select.querySelector('.custom-select__trigger');
    const options = select.querySelectorAll('.custom-option');
    const hiddenInput = document.getElementById('f-category');
    const triggerSpan = trigger.querySelector('span');

    trigger.addEventListener('click', () => {
        select.classList.toggle('open');
    });

    options.forEach(option => {
        option.addEventListener('click', () => {
            select.classList.remove('open');
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            triggerSpan.textContent = option.textContent;
            hiddenInput.value = option.getAttribute('data-value');
            trigger.style.borderColor = 'var(--primary)';
            trigger.style.background = '#ffffff';
        });
    });

    window.addEventListener('click', (e) => {
        if (!select.contains(e.target)) {
            select.classList.remove('open');
        }
    });

    loadReviews();
    const form = document.getElementById('feedback-form');
    if (form) form.onsubmit = submitReview;

    // Close modal when clicking outside
    window.onclick = function (event) {
        const modal = document.getElementById('edit-modal');
        const commentModal = document.getElementById('edit-comment-modal');
        if (event.target == modal) {
            closeEditModal();
        }
        if (event.target == commentModal) {
            closeEditCommentModal();
        }
    }
});

window.toggleLike = toggleLike;
window.toggleComments = toggleComments;
window.submitComment = submitComment;
window.translateMessage = translateMessage;
window.translateComment = translateComment;
window.deleteReview = deleteReview;
window.editReview = editReview;
window.closeEditModal = closeEditModal;
window.submitEditReview = submitEditReview;
window.editComment = editComment;
window.deleteComment = deleteComment;
window.closeEditCommentModal = closeEditCommentModal;
window.submitEditComment = submitEditComment;
