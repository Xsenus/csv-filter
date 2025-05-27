# CSV Filter

Это проект для загрузки, фильтрации и анализа CSV-данных. Состоит из двух частей:

- **csv-filter-client** — фронтенд на React (TypeScript, Vite или CRA)
- **csv-filter-server** — сервер на Node.js (TypeScript), с использованием SQLite

## 📦 Структура проекта

```
csv-filter/
├── csv-filter-client/   # React-приложение
├── csv-filter-server/   # Сервер: API, база, импорт CSV
└── README.md
```

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd csv-filter-client
npm install

cd ../csv-filter-server
npm install
```

### 2. Запуск фронтенда

```bash
cd csv-filter-client
npm start
```

Откроется [http://localhost:3000](http://localhost:3000)

### 3. Запуск сервера

```bash
cd csv-filter-server
npm run dev
```

API будет доступно по адресу `http://localhost:3001` (или указанному в настройках)

---

## ⚙️ Возможности

- 📥 Импорт CSV-файлов в базу данных SQLite
- 🔍 Динамическая фильтрация по полям
- ⚡️ Поддержка уникальности записей
- 🌐 Web-интерфейс для поиска и анализа данных
- 🧾 Настраиваемые типы полей и представление (например, `Мощность 24`)

---

## 📁 .gitignore

Убедитесь, что в `.gitignore` добавлены:

```gitignore
node_modules/
*.db
data/*.csv
.vscode/
build/
dist/
```

---

## 📚 Полезные команды

### Клиент

- `npm start` — запуск React-приложения
- `npm run build` — сборка production-версии

### Сервер

- `npm run dev` — запуск сервера с hot-reload (`ts-node-dev`)
- `npm run build` — компиляция TypeScript в JavaScript

---

## 🛠 Используемые технологии

- **React / TypeScript**
- **Node.js / Express**
- **SQLite / better-sqlite3**
- **CSV-parser**
- **Vite / Create React App**

---

## 📝 Лицензия

MIT License
