# TPC-Sound-Frontend
Технології
Frontend: React, TypeScript, Redux Toolkit, React Router, Axios
Backend: NestJS, TypeScript
Database: PostgreSQL
ORM: Prisma або TypeORM
Storage: Local Storage → у майбутньому AWS S3 / Cloudflare R2
Streaming: HTTP Streaming / HLS
Realtime: Socket.IO / WebSocket
UI: MUI + Styled Components
Auth: JWT + Refresh Tokens
Deploy: Docker + Docker Compose + Nginx
CI/CD: GitHub Actions
Основна ідея

Створити повноцінну музичну платформу, де користувачі можуть:

завантажувати треки
слухати музику
створювати плейлисти
лайкати
підписуватись на авторів
отримувати рекомендації
взаємодіяти через коментарі
стрімити музику без перезавантаження сторінки

Проєкт має масштабуватись до рівня mini-Spotify / SoundCloud.

Архітектура
Frontend (React)
Основні модулі
Authentication
Home Page
Search
Library
Playlist System
Upload System
Player System
Profile System
Notification System
Recommendation System
Admin Panel

├── Redux Toolkit
├── RTK Query
├── React Router
├── MUI
├── Styled Components
├── Framer Motion
└── WaveSurfer.js
