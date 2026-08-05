# SoundGravity

SoundGravity — інтерактивна музична платформа, що дозволяє слухати стріми, створювати плейлисти, вподобавати треки та насолоджуватися 3D-візуалізаціями музики з усього світу.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()

---

## 📖 Зміст
- [Особливості](#-особливості)
- [Стек технологій](#-стек-технологій)
- [Демо / Скріншоти](#-демо--скріншоти)
- [Вимоги](#-вимоги)
- [Встановлення та запуск](#-встановлення-та-запуск)
- [Використання](#-використання)
- [Конфігурація](#-конфігурація)
- [Внесок у проєкт (Contributing)](#-внесок-у-проєкт-contributing)
- [Ліцензія](#-ліцензія)
- [Контакти](#-контакти)

---

## ✨ Особливості

- ⚡ Потокове відтворення музики зі вбудованим плеєром, чергою та збереженням стану (трек, позиція, гучність) у локальному сховищі
- 🔒 Безпечна автентифікація — email/password та Google OAuth, refresh-token логіка на клієнті
- 📤 Завантаження треків із реальним прогресом завантаження (XHR + `upload.onprogress`)
- 🎵 Плейлисти з публічною/приватною видимістю та додаванням треків
- ❤️ Вподобання треків та плейлистів
- 🎨 3D-візуалізації та зоряне небо на базі three.js
- 🌍 Двомовність (українська / англійська) через i18next
- 🎭 Темна / світла тема та налаштування (кастомний курсор)

---

## 🛠 Стек технологій

- **Мова:** TypeScript / JavaScript (JSX)
- **Фреймворк:** React 19
- **Збірка:** Vite 8
- **Роутинг:** React Router 7
- **Стан:** Context API (auth, тема, мова, плеєр)
- **UI:** MUI (Material UI — іконки, слайдери, меню), flag-icons
- **Мережа:** fetch / XHR із refresh-token логікою (`src/API/apiClient.js`)
- **Локалізація:** i18next + react-i18next
- **Візуалізації:** three.js
- **Аналітика:** Vercel Analytics + Speed Insights

---

## 🖼 Демо / Скріншоти

Живе демо: [https://sound-gravity-frontend.vercel.app](https://sound-gravity-frontend.vercel.app)

<img width="1920" height="945" alt="screencapture-sound-gravity-frontend-vercel-app-auth-login-2026-08-05-21_28_25" src="https://github.com/user-attachments/assets/f5f12cbf-154f-495a-bebf-fc0a46508c4c" />
<img width="1920" height="5800" alt="screencapture-sound-gravity-frontend-vercel-app-2026-08-05-21_28_36" src="https://github.com/user-attachments/assets/7463bafe-5b15-4cf2-bdc9-63b10e321b0e" />
<img width="1920" height="945" alt="screencapture-sound-gravity-frontend-vercel-app-tracks-2026-08-05-21_29_55" src="https://github.com/user-attachments/assets/73e92faf-7299-424b-aa31-d52a64260021" />
<img width="1920" height="1073" alt="screencapture-sound-gravity-frontend-vercel-app-user-2026-08-05-21_30_06" src="https://github.com/user-attachments/assets/4aa7a46d-90d7-49a4-b560-841654ffe901" />
<img width="1920" height="1075" alt="screencapture-sound-gravity-frontend-vercel-app-track-fa3cfba3-3dbd-41af-941e-b9848b8ccc89-2026-08-05-21_30_41" src="https://github.com/user-attachments/assets/110c6cef-aea3-4495-a823-d3ee49d6fa91" />
<img width="1920" height="1075" alt="screencapture-sound-gravity-frontend-vercel-app-track-fa3cfba3-3dbd-41af-941e-b9848b8ccc89-2026-08-05-21_30_51" src="https://github.com/user-attachments/assets/904a66e9-7917-4626-991e-18bfb9a588e8" />
<img width="1920" height="1152" alt="screencapture-sound-gravity-frontend-vercel-app-tracks-create-2026-08-05-21_31_11" src="https://github.com/user-attachments/assets/780a00ac-fb06-4740-9b07-41304ea881a1" />


## ⚙️ Вимоги

Перед початком переконайтеся, що у вас встановлено:
- [Node.js](https://nodejs.org/) `>= 20.0.0`
- [npm](https://www.npmjs.com/) (постачається разом із Node.js)

---

## 🚀 Встановлення та запуск

1. **Клонуйте репозиторій:**
   ```bash
   git clone https://github.com/your-username/sound-gravity-frontend.git
   cd sound-gravity-frontend
   ```

2. **Встановіть залежності:**
   ```bash
   npm install
   ```

3. **Запустіть dev-сервер:**
   ```bash
   npm run dev
   ```

4. Відкрийте [http://localhost:5173](http://localhost:5173)

> **Примітка:** для повноцінної роботи потрібен запущений бекенд та змінна `VITE_APP_API_URL` (див. [Конфігурація](#-конфігурація)).

---

## 📦 Використання

### Збірка продакшн-версії

```bash
npm run build      # type-check (tsc) + vite build
```

### Перевірка коду

```bash
npm run lint       # eslint (ts/tsx)
```

### Локальний перегляд збірки

```bash
npm run preview
```

### Деплой

Проєкт розгортається на **Vercel** (`vercel.json` налаштовує SPA-rewrite). Деплой відбувається автоматично з обраної гілки.

---

## ⚙️ Конфігурація

Створіть файл `.env` у корені проєкту:

| Змінна | Опис | Приклад |
| --- | --- | --- |
| `VITE_APP_API_URL` | Базовий URL API-бекенду (обов'язково з `/api/`) | `https://api.example.com/api/` |

---

## 🧱 Структура проєкту

```
src/
├── API/            # клієнт API (fetch + refresh token)
├── components/     # компоненти (Header, Footer, Player, TracksList, ...)
├── context/        # UserContext, ThemeContext, LanguageContext, PlayerContext
├── i18n/           # локалізація (en / ua)
├── layouts/        # MainLayout
├── pages/          # сторінки (обгортки з Helmet + компонент)
├── router/         # конфігурація маршрутів
├── UI/             # перевикористовувані UI-елементи
├── utils/          # утиліти
└── photos/         # локальні зображення (логотіпи, заглушки)
```

---

## 🤝 Внесок у проєкт (Contributing)

Будь-який внесок вітається!

1. Форкніть репозиторій та створіть гілку: `git checkout -b feature/amazing-feature`
2. Внесіть зміни та закомітьте: `git commit -m 'Add amazing feature'`
3. Запуште гілку: `git push origin feature/amazing-feature`
4. Відкрийте Pull Request.

---

## 📄 Ліцензія

Проєкт поширюється під ліцензією [MIT](https://opensource.org/licenses/MIT). Додайте файл `LICENSE` перед публікацією репозиторію.

---

## 📬 Контакти

SoundGravity — [https://sound-gravity-frontend.vercel.app](https://sound-gravity-frontend.vercel.app)
