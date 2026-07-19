# Typeform Clone

A full-stack Typeform-inspired form builder built with **Next.js**, **FastAPI**, **PostgreSQL**, and **SQLAlchemy**.

## 🚀 Features

### Form Builder
- Create, edit, duplicate, and delete forms
- Drag-and-drop question reordering
- Multiple question types:
  - Short Text
  - Long Text
  - Multiple Choice
  - Dropdown
  - Yes / No
  - Email
  - Number
- Required field validation
- Publish / Unpublish forms

### Form Filling
- Public shareable form links
- Client-side validation
- Server-side validation
- Response submission
- Progress tracking
- Keyboard navigation

### Analytics
- Total responses
- Completion statistics
- Question-wise analytics
- Choice distribution
- Response summaries

### Backend
- FastAPI REST API
- SQLAlchemy ORM
- Alembic migrations
- PostgreSQL database
- Pydantic validation
- CORS support

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Zustand state management
- React Hook Form

---

# Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zustand

## Backend

- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Pydantic

---

# Project Structure

```
typeform/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── store/
│   └── package.json
│
├── backend/
│   ├── app/
│   ├── alembic/
│   ├── requirements.txt
│   └── alembic.ini
│
├── docker-compose.yml
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/vinayak0811/typeform.git
```

```
cd typeform
```

---

## Backend Setup

```
cd backend
```

Create virtual environment

```bash
python -m venv venv
```

Activate

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run migrations

```bash
alembic upgrade head
```

Start backend

```bash
uvicorn app.main:app --reload
```

Backend runs on

```
http://localhost:8000
```

---

## Frontend Setup

```
cd frontend
```

Install packages

```bash
npm install
```

Start development server

```bash
npm run dev
```

Frontend runs on

```
http://localhost:3000
```

---

# Environment Variables

Backend `.env`

```env
DATABASE_URL=postgresql://username:password@localhost/typeform
SECRET_KEY=your-secret-key
```

Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

# API Endpoints

## Forms

```
GET    /forms
POST   /forms
GET    /forms/{id}
PUT    /forms/{id}
DELETE /forms/{id}
POST   /forms/{id}/publish
POST   /forms/{id}/duplicate
```

## Responses

```
POST /responses
GET  /responses/{form_id}
```

## Analytics

```
GET /analytics/{form_id}
```

---

# Database

Main tables

- users
- forms
- questions
- choices
- responses
- answers

---

# Deployment

Frontend

- Vercel

Backend

- Railway

Database

- PostgreSQL

---

# Screenshots

Add screenshots here after deployment.

---

# Future Improvements

- Authentication
- Team Collaboration
- File Upload Questions
- Logic Jumps
- Themes
- Email Notifications
- Response Export
- AI Form Generation

---

# License

This project is licensed under the MIT License.

---

# Author

**Vinayak Pandey**

GitHub: https://github.com/vinayak0811