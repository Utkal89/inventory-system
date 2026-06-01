# StockFlow – Inventory & Order Management System

A full-stack inventory management system built with **FastAPI**, **React**, **PostgreSQL**, and **Docker**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python + FastAPI |
| Frontend | React (Create React App) |
| Database | PostgreSQL 15 |
| Containerization | Docker + Docker Compose |
| Backend Hosting | Render |
| Frontend Hosting | Vercel |

---

## Features

- **Products** – CRUD with unique SKU enforcement, stock tracking, low-stock alerts
- **Customers** – Add/list/delete with unique email enforcement
- **Orders** – Create multi-item orders with automatic stock reduction; cancel to restore stock
- **Dashboard** – Overview cards and low-stock warnings
- **Business rules** – Server-side validation: no negative stock, no over-ordering

---

## Local Development with Docker Compose

### Prerequisites
- Docker Desktop installed and running
- Git

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/inventory-system.git
cd inventory-system

# 2. Copy env template
cp .env.example .env
# Edit .env and set a strong POSTGRES_PASSWORD

# 3. Build and start all services
docker compose up --build

# 4. Open the app
# Frontend → http://localhost:3000
# Backend API docs → http://localhost:8000/docs
```

---

## Deployment Guide

### Step 1 – Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/inventory-system.git
git push -u origin main
```

---

### Step 2 – Deploy Backend on Render (Free)

1. Go to https://render.com → Sign up / Log in
2. Click **New +** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `inventory-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `DATABASE_URL` = (from Render Postgres, see below)
6. Click **Create Web Service**

**Add a free PostgreSQL database on Render:**
1. Click **New +** → **PostgreSQL**
2. Name it `inventory-db`, choose Free plan
3. After creation, copy the **Internal Database URL**
4. Go back to your backend service → Environment → set `DATABASE_URL` to the copied URL
5. Redeploy the backend

Your backend URL will be: `https://inventory-backend-XXXX.onrender.com`

---

### Step 3 – Push Docker Image to Docker Hub

```bash
# Login to Docker Hub
docker login

# Build the backend image
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest ./backend

# Push it
docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

Your Docker Hub image link: `https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/inventory-backend`

---

### Step 4 – Deploy Frontend on Vercel (Free)

1. Go to https://vercel.com → Sign up / Log in with GitHub
2. Click **New Project** → Import your repo
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
4. Under **Environment Variables**, add:
   - `REACT_APP_API_URL` = `https://inventory-backend-XXXX.onrender.com`
     *(your Render backend URL from Step 2)*
5. Click **Deploy**

Your frontend URL will be: `https://inventory-system-XXXX.vercel.app`

---

## Submission Checklist

- [ ] GitHub Repository: `https://github.com/YOUR_USERNAME/inventory-system`
- [ ] Docker Hub Image: `https://hub.docker.com/r/YOUR_USERNAME/inventory-backend`
- [ ] Frontend URL: `https://inventory-system-XXXX.vercel.app`
- [ ] Backend API URL: `https://inventory-backend-XXXX.onrender.com`

---

## API Endpoints

### Products
| Method | Endpoint | Description |
|---|---|---|
| POST | `/products` | Create product |
| GET | `/products` | List all products |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| POST | `/customers` | Create customer |
| GET | `/customers` | List all customers |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Create order (reduces stock) |
| GET | `/orders` | List all orders |
| GET | `/orders/{id}` | Get order details |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Summary stats + low stock |

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── main.py          # FastAPI routes
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── crud.py          # Database operations
│   ├── database.py      # DB connection
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios API calls
│   │   ├── pages/       # Dashboard, Products, Customers, Orders
│   │   ├── App.js       # Router + sidebar layout
│   │   └── App.css      # Global styles
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```
