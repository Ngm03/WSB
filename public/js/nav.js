document.addEventListener('DOMContentLoaded', () => {
    // SVG Icons
    const iconHome = `<svg class="nav-icon" viewBox="0 0 24 24"><path d="M16 11V5h-2v2.6l-2-1.6-2 1.6V5H8v6L3 15h18l-5-4zM10 5h4v3l-2-1.6-2 1.6V5zm-6 12h16v2H4v-2z"/></svg>`; // Tent/Gathering icon roughly
    const iconUsers = `<svg class="nav-icon" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`;
    const iconGame = `<svg class="nav-icon" viewBox="0 0 24 24"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`;
    const iconFeedback = `<svg class="nav-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;

    // Translation object
    const navTranslations = {
        ru: { gatherings: 'Сборы', pszone: 'PS Zone', feedback: 'Отзывы' },
        en: { gatherings: 'Gatherings', pszone: 'PS Zone', feedback: 'Feedback' },
        pl: { gatherings: 'Spotkania', pszone: 'PS Zone', feedback: 'Opinie' }
    };

    // Detect language (same logic as index.js)
    const tg = window.Telegram?.WebApp || {};
    const getUserLanguage = () => {
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang) return browserLang.split('-')[0];
        if (tg.initDataUnsafe?.user?.language_code) return tg.initDataUnsafe.user.language_code;
        if (tg.languageCode) return tg.languageCode;
        return 'en';
    };

    const userLang = getUserLanguage();
    const currentLang = ['ru', 'en', 'pl'].includes(userLang) ? userLang : 'en';
    const navT = navTranslations[currentLang];

    const navHTML = `
        <nav class="bottom-nav">
            <a href="index.html" class="nav-item" id="nav-home">
                ${iconUsers}
                <span data-nav-i18n="gatherings">${navT.gatherings}</span>
            </a>
            <a href="booking.html" class="nav-item" id="nav-booking">
                ${iconGame}
                <span data-nav-i18n="pszone">${navT.pszone}</span>
            </a>
            <a href="feedback.html" class="nav-item" id="nav-feedback">
                ${iconFeedback}
                <span data-nav-i18n="feedback">${navT.feedback}</span>
            </a>
        </nav>
    `;

    document.body.insertAdjacentHTML('beforeend', navHTML);

    // Highlight active link
    const path = window.location.pathname;
    if (path.includes('booking.html')) {
        document.getElementById('nav-booking').classList.add('active');
    } else if (path.includes('feedback.html')) {
        document.getElementById('nav-feedback').classList.add('active');
    } else {
        document.getElementById('nav-home').classList.add('active');
    }

    // Listen for language changes (if triggered from other pages)
    window.addEventListener('languagechange', () => {
        const newLang = getUserLanguage();
        const newNavT = navTranslations[['ru', 'en', 'pl'].includes(newLang) ? newLang : 'en'];
        document.querySelectorAll('[data-nav-i18n]').forEach(el => {
            const key = el.getAttribute('data-nav-i18n');
            if (newNavT[key]) el.textContent = newNavT[key];
        });
    });
});
