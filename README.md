# CSV Filter

Это проект для загрузки, фильтрации и анализа CSV-данных. Состоит из двух частей:

- **csv-filter-client** — фронтенд на React (TypeScript, Vite или CRA)
- **csv-filter-server** — сервер на Node.js (TypeScript), с использованием SQLite

---

## 📦 Структура проекта

```bash
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

### 2. Создание `.env` файлов

#### Для клиента (`csv-filter-client/.env`)

```env
PORT=3001
HOST=0.0.0.0
REACT_APP_API_BASE_URL=http://localhost:3002
```

> Укажите нужный адрес API, если работаете удалённо или на сервере.

#### Для сервера (`csv-filter-server/.env`)

```env
PORT=3002
```

> Сервер по умолчанию запускается на порту 3002.

---

### 3. Запуск фронтенда

```bash
cd csv-filter-client
npm start
```

Приложение будет доступно по адресу [http://localhost:3001](http://localhost:3001)

### 4. Запуск сервера

```bash
cd csv-filter-server
npm run dev
```

API будет доступно по адресу [http://localhost:3002](http://localhost:3002)

---

## ⚙️ Возможности

- 📥 Импорт CSV-файлов в базу данных SQLite (`/import`)
- 🔍 Динамическая фильтрация по всем полям
- ✅ Фильтры `Категория`, `Мощность`, `Фирма`, `Модель` отображаются первыми
- ⚡️ Поддержка уникальности записей по `id`
- 📊 Автообновление опций фильтров при импорте
- 🔗 Сервер возвращает опции (`/options`) и отфильтрованные данные (`/filters`)
- 💡 Поддержка поля `PowerName` и `BlockPlacement` из `Note`

---

## 📁 .gitignore

Убедитесь, что `.gitignore` содержит:

```gitignore
node_modules/
*.db
data/*.csv
.vscode/
build/
dist/
.env
.env.*
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

- **React / TypeScript / Vite или CRA**
- **Node.js / Express**
- **SQLite / better-sqlite3**
- **CSV-parser**
- **Axios**
- **dotenv**
- **ts-node-dev**

---

## 📝 Лицензия

MIT License
