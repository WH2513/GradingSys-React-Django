# AI-Powered Grading System (React + Django)

A full‑stack grading management system built with **React** (frontend) and **Django REST Framework** (backend).  
It allows instructors to upload assignments, students to submit work, and graders to evaluate submissions efficiently by leveraging the power of Gen AI.

This system dramatically reduces grading time while keeping instructors in full control.
The AI doesn’t replace the grader — it accelerates them.

---

## 🚀 Features

### 👩‍🏫 Instructor
- Create and manage assignments
- Upload assignment files
- View student submissions
- Track grading progress

### 🧑‍🎓 Student
- View available assignments
- Upload submissions
- Track submission status

### 📝 Grader
- Grade student submissions
- Upload grading files / feedback
- Update grading status
- Use AI grading assistant to help grading

### 📊 Admin / System
- Dashboard with statistics
- File storage via Cloudflare R2
- Secure API with JWT authentication

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Axios
- React Router

### Backend
- Django
- Django REST Framework
- Cloudflare R2 for file storage
- PostgreSQL (Production) / SQLite (Local)

### AI
- Llama 3.1 8B
- Local inference via Ollama
- Custom grading prompt with rubric + example answer reasoning

---

## 📦 Installation

### 1. Clone the repository
```bash
git clone https://github.com/WH2513/gradingsys-react-django.git
cd gradingsys-react-django
```
### 2. Backend Setup (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Environment variables you need:
```bash
R2_ACCOUNT_ID=xxxx
R2_ACCESS_KEY_ID=xxxx
R2_SECRET_ACCESS_KEY=xxxx
R2_BUCKET_NAME="grading-sys-files"
PAGE_SIZE=xx(e.g. 10)
SENDGRID_API_KEY=xxxx
```


### 💻 Frontend Setup (React)
```bash
cd frontend
npm install
npm run dev
```

Configure your API base URL in .env
```bash
VITE_API_URL = 'http://127.0.0.1:8000' (or your-backend-domain)
```

### AI Setup 
On Windows
```bash
irm https://ollama.com/install.ps1 | iex
ollama pull llama3.1
ollama run llama3.1
```
To check if the model is running
```bash
curl http://localhost:11434/api/tags
```
---

## 📁 Project Structure
```bash
GradingSys-React-Django/
│
├── backend/
│   ├── api/
│   │   ├── migrations
│   │   ├── serializers
│   │   ├── services
│   │   ├── tests
│   │   ├── views
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── urls.py
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   └── App.jsx
│   └── ...
│
└── README.md
```
---

## ▶️ Usage

### Start backend:
```bash
python manage.py runserver
```

### Start frontend:
```bash
npm run dev
```

### Then open:
```bash
http://localhost:5173
```
---

## 🧪 Running Tests

### Backend
```bash
pytest
```

### Frontend
```bash
npm test
```
---
## CI/CD
### 🧪 Backend CI (Django)
.github/workflows/backend-ci.yml



### 🎨 Frontend CI (React)
.github/workflows/frontend-ci.yml


### 🚀 CD (Production)
Backend is deployed on Railway;

Frontend is deployed on Cloudflare Pages @ https://gradingsys-react-django.pages.dev/
