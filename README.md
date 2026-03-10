<div align="center">
  <img src="https://via.placeholder.com/150x150/000000/00A3FF?text=DevRoot+Logo" alt="DevRoot Logo" width="120" />

  # 🚀 DevRoot
  
  **A Modern Project & Asset Management Platform for Animation and Interactive Teams**

  ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
  ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
  ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
  ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

<br />

## 📋 Overview
**Deployed Link** : https://devroot-omega.vercel.app/
**Vibe Coded AI integration** : https://dev-root-manager-661978.withmattr.app
**DevRoot** is a full-stack, role-based management system designed specifically to streamline workflows for creative and development departments. By organizing projects into strict phases (Scripts, Design, Development, and Testing), DevRoot ensures that team members only interact with the assets and timelines relevant to their specific assignments.

---

## ✨ Core Features

| Feature | Description |
| :--- | :--- |
| 🔐 **Role-Based Access (RBAC)** | Distinct, secure dashboards for Managers and standard Users (Designers, Developers, Script Writers). |
| 🛤️ **Phase-Based Tracking** | Track project lifecycles across strictly defined developmental phases. |
| ☁️ **Secure Asset Management** | Upload, download, and organize files natively within project phases, powered by **Supabase**. |
| 🛡️ **Smart Permissions** | Users can only upload, modify, or delete assets in the specific phases they are assigned to. |
| 🏢 **Company Directory** | A fully searchable UI showcasing team structures, managers, and employee credentials. |
| 📊 **Real-Time Dashboards** | Personalized user views displaying only assigned projects alongside dynamic pending/completed statistics. |

---

## 📸 Screenshots


<div align="center">
  <img src="https://via.placeholder.com/800x400/111/444?text=Manager+Dashboard" alt="Manager Dashboard Preview" width="48%">
  <img src="https://via.placeholder.com/800x400/111/444?text=User+Asset+Folder+View" alt="Folder View Preview" width="48%">
</div>

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v16.x or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
- A [Supabase](https://supabase.com/) account and project set up for cloud storage.

### 1. Clone the Repository

```bash
1. Clone Repo
2. Environment Variables
You will need to create two .env files. Use the tables below as a reference.

Backend (server/.env)
| Variable | Description | Example |
| :--- | :--- | :--- |
| PORT | The port your backend runs on | 5000 |
| MONGO_URI | Your MongoDB connection string | mongodb+srv://... |
| JWT_SECRET | Secret key for signing tokens | your_super_secret_key |
| SUPABASE_URL | Your Supabase project URL | https://xyz.supabase.co |
| SUPABASE_KEY | Your Supabase API key | eyJhbG... |
| SUPABASE_BUCKET| The name of your storage bucket | devroot-assets |

Frontend (client/.env)
| Variable | Description | Example |
| :--- | :--- | :--- |
| VITE_API_BASE_URL | The base URL for your backend API | http://localhost:5000/api |

3. Installation & Execution
Open two separate terminal windows.

Terminal 1: Backend

Bash
cd server
npm install
npm run dev
Terminal 2: Frontend

Bash
cd client
npm install
npm run dev
The application should now be running on http://localhost:5173.

📂 Architecture Overview
Plaintext
devroot/
├── client/                 # React Frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/     # Reusable UI (Sidebars, Cards, Modals)
│   │   ├── pages/          # Layouts (Manager & User Dashboards)
│   │   ├── utils/          # Axios interceptors & API config
│   │   └── App.jsx         # Application routing matrix
├── server/                 # Express Backend
│   ├── src/
│   │   ├── controllers/    # Business logic (projects, users, files)
│   │   ├── middleware/     # JWT verification & RBAC validation
│   │   ├── models/         # Mongoose Data Schemas
│   │   └── routes/         # Express API endpoints
│   └── server.js           # Server initialization
🔒 Default Access (For Testing)
If you have seeded the database, you can use the following default credentials to explore the Manager Dashboard:

Email: adminf@devroot.com

Password: password123
