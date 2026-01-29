import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import ManagerHome from './pages/manager/ManagerHome';
import UserHome from './pages/user/UserHome';
import ProjectList from './pages/manager/ProjectList';
import ProjectDetails from './pages/manager/ProjectDetails';
import FolderView from './pages/manager/FolderView';
import DepartmentList from './pages/manager/DepartmentList';
import DepartmentDetails from './pages/manager/DepartmentDetails';
import UserList from './pages/manager/UserList';
import UserDetails from './pages/manager/UserDetails'; // 👈 ⭐ IMPORT THIS!

// Placeholders
const ProjectsPlaceholder = () => <h1 className="text-2xl text-white">📂 Projects Page</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" />} />
        <Route path="/auth/login" element={<Login />} />

        {/* 🔐 PROTECTED LAYOUT WRAPPER */}
        <Route element={<Layout />}>
          
          {/* Manager Routes */}
          <Route path="/dashboard-manager" element={<ManagerHome />} />
          
          {/* USERS SECTION */}
          <Route path="/dashboard-manager/users" element={<UserList />} />
          {/* ⭐ The Route is correct, but requires the import above */}
          <Route path="/dashboard-manager/users/:id" element={<UserDetails />} />
          
          
          {/* DEPARTMENTS SECTION */}
          <Route path="/dashboard-manager/departments" element={<DepartmentList />} />
          <Route path="/dashboard-manager/departments/:id" element={<DepartmentDetails />} />
          
          {/* PROJECTS SECTION */}
          <Route path="/dashboard-manager/projects" element={<ProjectList />} />
          <Route path="/dashboard-manager/projects/:id" element={<ProjectDetails />} />
          <Route path="/dashboard-manager/projects/:id/:phase/:subfolder?" element={<FolderView />} />

          {/* User Routes */}
          <Route path="/dashboard-user" element={<UserHome />} />
          <Route path="/dashboard-user/projects" element={<ProjectsPlaceholder />} />
          <Route path="/dashboard-user/profile" element={<h1 className="text-white">👤 My Profile</h1>} />
        
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;