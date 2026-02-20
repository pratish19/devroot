# 🚀 DevRoot

DevRoot is a full-stack project and asset management system built for animation and interactive departments. It streamlines workflows by organizing projects into distinct phases (Scripts, Design, Development, and Testing) with secure, role-based file management and team assignments.

## ✨ Key Features

* **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Managers and standard Users (Designers, Developers, Script Writers).
* **Phase-Based Project Tracking:** Track project progress across distinct development phases. 
* **Secure Asset Management:** Upload, download, and manage assets natively within assigned project phases. Powered by Supabase Cloud Storage.
* **Smart Permissions:** Users can only upload or delete files in the specific phases (e.g., Design, Development) they are officially assigned to.
* **Company Directory:** A fully searchable department directory showcasing team structures and managers.
* **Personalized Dashboards:** Users get a custom dashboard displaying only their assigned projects and real-time pending/completed statistics.

## 🛠️ Tech Stack

**Frontend:**
* React (Vite)
* Tailwind CSS (for sleek, dark-mode UI styling)
* React Router DOM (Routing)
* Axios (API requests)
* React Icons

**Backend & Storage:**
* Node.js & Express.js
* MongoDB & Mongoose (Database)
* Supabase (Cloud Storage for file assets)
* JSON Web Tokens (JWT) & bcryptjs (Authentication)
* Multer (File handling middleware)

---

## ⚙️ Local Setup & Installation

### Prerequisites
Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
* A [Supabase](https://supabase.com/) account (for file storage)

### 1. Clone the repository

### 2. Backend Setup
\`\`\`bash
cd server
npm install
\`\`\`

Create a `.env` file inside the `server` directory and add the following variables:
\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_or_service_key
SUPABASE_BUCKET=your_supabase_bucket_name
\`\`\`

Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Frontend Setup
Open a new terminal window and navigate to the client folder:
\`\`\`bash
cd client
npm install
\`\`\`

Create a `.env` file inside the `client` directory:
\`\`\`env
VITE_API_BASE_URL=http://localhost:5000/api
\`\`\`

Start the frontend development server:
\`\`\`bash
npm run dev
\`\`\`

---

## 📂 Folder Structure Overview

\`\`\`text
devroot/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI elements (Sidebars, Cards)
│   │   ├── pages/          # Page views (Auth, Manager Dashboard, User Dashboard)
│   │   ├── utils/          # Axios interceptors and API setup
│   │   └── App.jsx         # Main routing file
├── server/                 # Node/Express Backend
│   ├── src/
│   │   ├── controllers/    # Route logic (projects, users, files, auth)
│   │   ├── middleware/     # JWT protection & Role validation
│   │   ├── models/         # Mongoose Schemas
│   │   └── routes/         # Express API endpoints
│   └── server.js           # Entry point
└── README.md
\`\`\`

## 🔒 Default Admin Access (Development)
If you are seeding the database for the first time, you can log in with the default manager credentials (ensure you have run your seed script if applicable):
* **Email:** `adminf@devroot.com`
* **Password:** `password123` *(or your seeded password)*
