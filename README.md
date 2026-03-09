# ANN-AI

**AI-Powered Smart Mess Management System**

ANN-AI is a web-based intelligent mess management platform designed to reduce food waste, improve meal quality, and optimize hostel dining operations using AI-powered demand prediction and feedback analysis.

The system predicts student attendance for meals, analyzes complaints and feedback, and provides insights to mess administrators through interactive dashboards.

---

# Features

* AI Demand Prediction for mess attendance
* Admin analytics dashboard
* Student feedback collection system
* Complaint trend analysis
* Smart mess management interface
* Role-based dashboards (Admin, Student, Mess Staff)
* Real-time operational insights

---

# Tech Stack

**Frontend**

* Next.js
* TypeScript
* TailwindCSS
* Framer Motion

**Backend**

* FastAPI
* Python
* Pydantic

**AI / ML**

* Scikit-learn
* Joblib model storage

---

# Project Structure

```
ANN-AI
│
├── frontend
│   ├── src/app
│   ├── components
│   └── package.json
│
├── backend
│   ├── app
│   │   ├── routers
│   │   ├── model
│   │   └── main.py
│   └── requirements.txt
│
└── README.md
```

---

# How to Run the Project Locally

Follow the steps below to run ANN-AI on your local machine.

## 1. Clone the Repository

```bash
git clone https://github.com/mdmusharraf01/ANN-AI.git
```

```
cd ANN-AI
```

---

# 2. Backend Setup (FastAPI)

Navigate to the backend folder.

```bash
cd backend
```

Create a virtual environment.

```bash
python -m venv venv
```

Activate the virtual environment.

### Windows

```bash
venv\Scripts\activate
```

### Mac / Linux

```bash
source venv/bin/activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Start the backend server.

```bash
uvicorn app.main:app --reload
```

Backend will run at:

```
http://127.0.0.1:8000
```

Swagger API docs will be available at:

```
http://127.0.0.1:8000/docs
```

---

# 3. Frontend Setup (Next.js)

Open a new terminal and navigate to the frontend folder.

```bash
cd frontend
```

Install dependencies.

```bash
npm install
```

Create a `.env.local` file inside the frontend folder and add:

```
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
```

Start the frontend development server.

```bash
npm run dev
```

Frontend will run at:

```
http://localhost:3000
```

---

# How the System Works

1. Students provide feedback after meals.
2. Historical attendance and feedback data are analyzed.
3. AI models predict expected attendance for upcoming meals.
4. The system recommends food preparation quantities.
5. Administrators monitor complaints, trends, and waste metrics through dashboards.

---

# Deployment

The project can be deployed using the following platforms:

Frontend:

* Vercel

Backend:

* Render or Railway

Environment variables must be configured for production deployments.

---

# Project Credits

Developed by **Mohammed Musharraf Ali & Team ANN-AI**

Built as part of a hackathon project focused on applying artificial intelligence to reduce food waste and improve hostel dining operations.

LinkedIn:
https://www.linkedin.com/in/mohammed-musharraf-ali-525874272

---

# License

This project is created for educational and demonstration purposes.
