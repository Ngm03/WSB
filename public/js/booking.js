const tg = window.Telegram.WebApp;

// Initialize
tg.expand();
tg.MainButton.textColor = '#FFFFFF';
tg.MainButton.color = '#7c3aed';

const API_URL = '/api';

// Detect user language
const getUserLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang) return browserLang.split('-')[0];
    if (tg.initDataUnsafe?.user?.language_code) return tg.initDataUnsafe.user.language_code;
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
        // First, get the user's photo from Telegram
        const photoResponse = await fetch(`${API_URL}/user/photo/${currentUser.id}`);
        const photoData = await photoResponse.json();

        if (photoData.photo_url) {
            currentUser.photo_url = photoData.photo_url;
        }

        // Then sync all user data
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
        pageTitle: 'Бронь PS Zone - 3 Этаж',
        pageTitleFloor1: 'Бронь PS Zone - 1 Этаж',
        floor3: '3 Этаж',
        floor1: '1 Этаж',
        selectDate: 'Выберите дату',
        newBooking: 'Новая бронь',
        start: 'Начало',
        end: 'Конец',
        comment: 'Комментарий',
        commentPlaceholder: 'FIFA, Mortal Kombat...',
        bookButton: 'Забронировать',
        bookingDetails: 'Детали брони',
        bookedBy: 'Бронирует',
        edit: 'Редактировать',
        delete: 'Удалить',
        selectTime: 'Выберите время',
        done: 'Готово',
        translate: 'Перевести',
        hours: 'ч',
        minutes: 'мин',
        noBookings: 'На этот день пока нет бронирований',
        clickPlus: 'Нажмите +, чтобы занять время',
        loadError: 'Ошибка загрузки'
    },
    en: {
        pageTitle: 'PS Zone Booking - 3rd Floor',
        pageTitleFloor1: 'PS Zone Booking - 1st Floor',
        floor3: '3rd Floor',
        floor1: '1st Floor',
        selectDate: 'Select a date',
        newBooking: 'New Booking',
        start: 'Start',
        end: 'End',
        comment: 'Comment',
        commentPlaceholder: 'FIFA, Mortal Kombat...',
        bookButton: 'Book',
        bookingDetails: 'Booking Details',
        bookedBy: 'Booked by',
        edit: 'Edit',
        delete: 'Delete',
        selectTime: 'Select time',
        done: 'Done',
        translate: 'Translate',
        hours: 'h',
        minutes: 'min',
        noBookings: 'No bookings for this day yet',
        clickPlus: 'Click + to book a time slot',
        loadError: 'Loading error'
    },
    pl: {
        pageTitle: 'Rezerwacja PS Zone - 3 Piętro',
        pageTitleFloor1: 'Rezerwacja PS Zone - 1 Piętro',
        floor3: '3 Piętro',
        floor1: '1 Piętro',
        selectDate: 'Wybierz datę',
        newBooking: 'Nowa Rezerwacja',
        start: 'Początek',
        end: 'Koniec',
        comment: 'Komentarz',
        commentPlaceholder: 'FIFA, Mortal Kombat...',
        bookButton: 'Zarezerwuj',
        bookingDetails: 'Szczegóły Rezerwacji',
        bookedBy: 'Zarezerwowane przez',
        edit: 'Edytuj',
        delete: 'Usuń',
        selectTime: 'Wybierz czas',
        done: 'Gotowe',
        translate: 'Przetłumacz',
        hours: 'godz',
        minutes: 'min',
        noBookings: 'Brak rezerwacji na ten dzień',
        clickPlus: 'Kliknij +, aby zarezerwować czas',
        loadError: 'Błąd ładowania'
    }
};

let t = translations[['ru', 'en', 'pl'].includes(currentUser.language_code) ? currentUser.language_code : 'en'];

function updateInterface() {
    const lang = currentUser.language_code || 'en';
    t = translations[lang] || translations['en'];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });

    const pageTitle = currentFloor === 3 ? t.pageTitle : t.pageTitleFloor1;
    document.title = pageTitle;
    const headerTitle = document.querySelector('header h1');
    if (headerTitle) headerTitle.textContent = pageTitle;
}

document.addEventListener('DOMContentLoaded', () => {
    updateInterface();
});

window.addEventListener('languagechange', () => {
    const newLang = getUserLanguage();
    if (newLang !== currentUser.language_code) {
        currentUser.language_code = newLang;
        updateInterface();
        syncUserData();
    }
});

// --- Helper Functions ---

function showTelegramAlert(message) {
    if (window.Telegram?.WebApp?.showPopup) {
        try {
            window.Telegram.WebApp.showPopup({
                title: 'Внимание',
                message: message,
                buttons: [{ type: 'ok' }]
            });
        } catch (e) {
            console.warn('showPopup failed, falling back to alert', e);
            alert(message);
        }
    } else {
        alert(message);
    }
}

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function calculateDuration(start, end) {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const diff = endMin - startMin;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    if (hours > 0 && minutes > 0) return `${hours}${t.hours} ${minutes}${t.minutes}`;
    if (hours > 0) return `${hours}${t.hours}`;
    return `${minutes}${t.minutes}`;
}

// --- State ---

let currentFloor = 3;
let bookings = [];
let selectedDate = new Date();
let currentMonth = new Date();
let currentEditingBooking = null;

// --- DOM Elements ---

const floorBtns = document.querySelectorAll('.floor-option');
const calendar = document.getElementById('calendar-grid');
const monthTitle = document.getElementById('month-title');
const list = document.getElementById('schedule-list');
const fab = document.getElementById('fab');
const modalOverlay = document.getElementById('booking-modal-overlay');
const form = document.getElementById('booking-form');

// --- Floor Switching ---

floorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        floorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFloor = parseInt(btn.dataset.floor);
        updateInterface();
        loadBookings();
    });
});

// --- Calendar Rendering ---

function renderCalendar() {
    const locale = currentUser.language_code === 'ru' ? 'ru-RU' : currentUser.language_code === 'pl' ? 'pl-PL' : 'en-US';
    const options = { month: 'long', year: 'numeric' };
    monthTitle.textContent = currentMonth.toLocaleDateString(locale, options);

    const grid = calendar;
    grid.innerHTML = '';

    const daysMap = {
        'ru': ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        'en': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        'pl': ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie']
    };
    const days = daysMap[currentUser.language_code] || daysMap['en'];
    days.forEach(day => {
        const el = document.createElement('div');
        el.className = 'calendar-day-header';
        el.textContent = day;
        grid.appendChild(el);
    });

    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    let dayOfWeek = firstDay.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7;
    dayOfWeek -= 1;

    for (let i = 0; i < dayOfWeek; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }

    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= lastDay; day++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateStr = formatDate(date);
        const dayBookings = bookings.filter(b => b.date === dateStr);

        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;

        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayEl.classList.add('today');
        }

        if (date.toDateString() === selectedDate.toDateString()) {
            dayEl.classList.add('selected');
        }

        if (dayBookings.length > 0) {
            const badge = document.createElement('span');
            badge.className = 'cal-badge';
            badge.textContent = dayBookings.length;
            dayEl.appendChild(badge);
        }

        dayEl.onclick = () => {
            selectedDate = date;
            renderCalendar();
            renderSchedule();
        };

        grid.appendChild(dayEl);
    }
}

function renderSchedule() {
    const dateStr = formatDate(selectedDate);
    const dayBookings = bookings.filter(b => b.date === dateStr);

    const locale = currentUser.language_code === 'ru' ? 'ru-RU' : currentUser.language_code === 'pl' ? 'pl-PL' : 'en-US';
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const title = document.getElementById('selected-date-title');
    title.textContent = selectedDate.toLocaleDateString(locale, options);

    if (dayBookings.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; padding: 40px; color: var(--text-secondary); animation: fadeInUp 0.4s ease-out;">
                <p>${t.noBookings}</p>
                <p style="font-size:13px; margin-top:8px;">${t.clickPlus}</p>
            </div>
        `;
    } else {
        list.innerHTML = '';
        dayBookings.sort((a, b) => a.slot_time.localeCompare(b.slot_time));
        dayBookings.forEach(booking => {
            const card = createBookingCard(booking);
            list.appendChild(card);
        });
    }
}

function createBookingCard(booking) {
    const card = document.createElement('div');
    card.className = 'booking-card';
    card.onclick = () => openDetailsModal(booking);

    const now = new Date();
    const bookingDate = new Date(booking.date + 'T' + booking.end_time);
    if (bookingDate < now) {
        card.classList.add('past');
    }

    const displayName = booking.first_name || booking.username || 'Guest';
    const avatar = booking.photo_url
        ? `<img src="${booking.photo_url}" class="booking-avatar" alt="Avatar">`
        : `<div class="booking-avatar" style="background:#e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-weight:700;">${displayName[0] || '?'}</div>`;

    card.innerHTML = `
        <div class="booking-time">
            <div class="time-start">${booking.slot_time}</div>
            <div class="time-end">${booking.end_time}</div>
        </div>
        <div class="booking-info">
            <div class="booking-user">
                ${avatar}
                <span>${displayName}</span>
            </div>
            <div class="booking-comment">${booking.comment || ''}</div>
        </div>
        <div class="booking-status"></div>
    `;

    return card;
}

// --- Month Navigation ---

document.getElementById('prev-month').onclick = () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar();
};

document.getElementById('next-month').onclick = () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar();
};

// --- Load Bookings ---

async function loadBookings() {
    try {
        const response = await fetch(`${API_URL}/bookings?floor=${currentFloor}`);
        const data = await response.json();
        bookings = data.data;
        renderCalendar();
        renderSchedule();
    } catch (error) {
        console.error('Error loading bookings:', error);
        list.innerHTML = `<div style="text-align:center;padding:20px;color:red;">${t.loadError}</div>`;
    }
}

// --- Time Picker ---

const tpModal = document.getElementById('time-picker-overlay');
const tpHours = document.getElementById('tp-hours');
const tpMinutes = document.getElementById('tp-minutes');
const tpConfirm = document.getElementById('tp-confirm');
let selectedHour = '12';
let selectedMinute = '00';
let tpTarget = 'start';
const ITEM_HEIGHT = 44;

function openTimePicker(target) {
    tpTarget = target;
    tpModal.classList.add('active');

    tpHours.innerHTML = '';
    tpMinutes.innerHTML = '';

    for (let i = 0; i < 24; i++) {
        const val = String(i).padStart(2, '0');
        const el = document.createElement('div');
        el.className = 'time-picker-item';
        el.textContent = val;
        el.dataset.value = val;
        tpHours.appendChild(el);
    }

    for (let i = 0; i < 60; i++) {
        const val = String(i).padStart(2, '0');
        const el = document.createElement('div');
        el.className = 'time-picker-item';
        el.textContent = val;
        el.dataset.value = val;
        tpMinutes.appendChild(el);
    }

    setupScrollListener(tpHours, 'hour');
    setupScrollListener(tpMinutes, 'minute');
}

function setupScrollListener(container, type) {
    let isScrolling;
    container.addEventListener('scroll', () => {
        window.clearTimeout(isScrolling);
        updateVisuals(container);
        isScrolling = setTimeout(() => {
            const index = Math.round(container.scrollTop / ITEM_HEIGHT);
            const items = container.querySelectorAll('.time-picker-item');
            if (items[index]) {
                const val = items[index].dataset.value;
                if (type === 'hour') selectedHour = val;
                else selectedMinute = val;
                container.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
            }
        }, 100);
    });
}

function updateVisuals(container) {
    const center = container.scrollTop + (container.clientHeight / 2);
    const items = container.querySelectorAll('.time-picker-item');
    items.forEach(item => {
        const itemCenter = item.offsetTop + (item.clientHeight / 2);
        const dist = Math.abs(center - itemCenter);
        if (dist < ITEM_HEIGHT / 2) {
            item.classList.add('selected');
            item.style.opacity = 1;
            item.style.transform = 'scale(1.1)';
        } else {
            item.classList.remove('selected');
            item.style.opacity = 0.5;
            item.style.transform = 'scale(1)';
        }
    });
}

document.getElementById('trigger-start').onclick = function () {
    this.classList.add('active');
    document.getElementById('trigger-end').classList.remove('active');
    openTimePicker('start');
};

document.getElementById('trigger-end').onclick = function () {
    this.classList.add('active');
    document.getElementById('trigger-start').classList.remove('active');
    openTimePicker('end');
};

tpConfirm.onclick = () => {
    const timeStr = `${selectedHour}:${selectedMinute}`;
    if (tpTarget === 'start') {
        document.getElementById('trigger-start').textContent = timeStr;
        document.getElementById('b-start').value = timeStr;
    } else {
        document.getElementById('trigger-end').textContent = timeStr;
        document.getElementById('b-end').value = timeStr;
    }
    tpModal.classList.remove('active');
};

tpModal.onclick = (e) => {
    if (e.target === tpModal) tpModal.classList.remove('active');
};

// --- Submit Booking ---

form.onsubmit = async (e) => {
    e.preventDefault();

    if (currentUser.id === 'guest') {
        showTelegramAlert('Бронирование доступно только через Telegram Mini App!');
        return;
    }
    const start = document.getElementById('b-start').value;
    const end = document.getElementById('b-end').value;
    const comment = document.getElementById('b-comment').value;

    if (!start || !end) {
        showTelegramAlert('Выберите время начала и конца!');
        return;
    }

    if (currentEditingBooking) {
        if (start < currentEditingBooking.slot_time || end > currentEditingBooking.end_time) {
            showTelegramAlert('Можно только уменьшить время брони!');
            return;
        }
    }

    const dateStr = formatDate(selectedDate);
    const url = currentEditingBooking ? `${API_URL}/bookings/${currentEditingBooking.id}` : `${API_URL}/bookings`;
    const method = currentEditingBooking ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': currentUser.id,
                'x-telegram-init-data': window.Telegram.WebApp.initData
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                username: currentUser.username,
                first_name: currentUser.first_name,
                photo_url: currentUser.photo_url,
                language_code: currentUser.language_code,
                date: dateStr,
                slot_time: start,
                end_time: end,
                floor: currentFloor,
                comment: comment
            })
        });

        const result = await response.json();
        if (response.ok) {
            showTelegramAlert(currentEditingBooking ? 'Бронь обновлена! ✅' : 'Успешно забронировано! 🎮');
            modalOverlay.classList.remove('active');
            currentEditingBooking = null;
            document.querySelector('#booking-modal-overlay .modal-title').textContent = 'Новая бронь';
            document.querySelector('#booking-form .btn').textContent = 'Забронировать';
            loadBookings();
        } else {
            showTelegramAlert(result.error || 'Ошибка');
        }
    } catch (error) {
        console.error('Error:', error);
        showTelegramAlert('Ошибка сети');
    }
};

// --- FAB ---

fab.onclick = () => {
    if (currentUser.id === 'guest') {
        showTelegramAlert('Бронирование доступно только через Telegram Mini App!');
        return;
    }
    const locale = currentUser.language_code === 'ru' ? 'ru-RU' : currentUser.language_code === 'pl' ? 'pl-PL' : 'en-US';
    const dateStr = selectedDate.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
    document.getElementById('sheet-date').textContent = dateStr;

    document.getElementById('trigger-start').textContent = '--:--';
    document.getElementById('trigger-end').textContent = '--:--';
    document.getElementById('b-start').value = '';
    document.getElementById('b-end').value = '';
    document.getElementById('b-comment').value = '';

    document.querySelectorAll('.custom-input').forEach(el => el.classList.remove('active'));
    modalOverlay.classList.add('active');
};

// Start
loadBookings();
