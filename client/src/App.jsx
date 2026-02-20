import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout'; // Main/Manager Layout
import Login from './pages/auth/Login';

// --- 👔 MANAGER IMPORTS ---
import ManagerHome from './pages/manager/ManagerHome';
import ProjectList from './pages/manager/ProjectList';
import ProjectDetails from './pages/manager/ProjectDetails';
import FolderView from './pages/manager/FolderView';
import DepartmentList from './pages/manager/DepartmentList';
import DepartmentDetails from './pages/manager/DepartmentDetails';
import UserList from './pages/manager/UserList';
import UserDetails from './pages/manager/UserDetails';

// --- 🎨 USER IMPORTS ---
import UserDashboard from './pages/user/UserDashboard';
import UserSidebar from './components/UserSidebar';
import UserProjects from './pages/user/UserProjects';
import UserProjectDetails from './pages/user/UserProjectDetails'; // 👈 NEW IMPORT
import UserDepartments from './pages/user/UserDepartments';
import UserDepartmentDetails from './pages/user/UserDepartmentDetails';
import UserProfile from './pages/user/UserProfile';

// --- 🛠️ HELPER: User Page Wrapper ---
const UserPageLayout = ({ children, title }) => (
  <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
    <UserSidebar />
    <div className="flex-1 flex flex-col overflow-auto p-10">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      {children}
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🚀 AUTH ROUTES */}
        <Route path="/" element={<Navigate to="/auth/login" />} />
        <Route path="/auth/login" element={<Login />} />

        {/* 🔐 MANAGER ROUTES (Wrapped in Main Layout) */}
        <Route element={<Layout />}>
          <Route path="/dashboard-manager" element={<ManagerHome />} />
          
          {/* Users */}
          <Route path="/dashboard-manager/users" element={<UserList />} />
          <Route path="/dashboard-manager/users/:id" element={<UserDetails />} />
          
          {/* Departments */}
          <Route path="/dashboard-manager/departments" element={<DepartmentList />} />
          <Route path="/dashboard-manager/departments/:id" element={<DepartmentDetails />} />
          
          {/* Projects */}
          <Route path="/dashboard-manager/projects" element={<ProjectList />} />
          <Route path="/dashboard-manager/projects/:id" element={<ProjectDetails />} />
          <Route path="/dashboard-manager/projects/:id/:phase/:subfolder?" element={<FolderView />} />
        </Route>

        {/* 🎨 USER ROUTES (Designers/Developers) */}
        
        {/* 1. Dashboard */}
        <Route path="/dashboard-user" element={<UserDashboard />} />

        {/* 2. My Projects List */}
        <Route path="/dashboard-user/projects" element={<UserProjects />} />

        {/* 3. Project Overview (READ ONLY) - ✅ UPDATED */}
        <Route path="/dashboard-user/projects/:id" element={<UserProjectDetails />} />
        <Route path="/dashboard-user/projects/:id/:phase/:subfolder?" element={<FolderView />} />

        {/* 4. Departments */}
        <Route path="/dashboard-user/departments" element={<UserDepartments />} />
        {/* 👇 ADD THIS NEW ROUTE */}
        <Route path="/dashboard-user/departments/:id" element={<UserDepartmentDetails />} />

        {/* 5. My Profile */}
        <Route path="/dashboard-user/profile" element={<UserProfile />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;