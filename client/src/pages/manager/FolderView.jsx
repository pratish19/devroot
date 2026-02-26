import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaCloudUploadAlt, FaFile, FaSpinner, FaArrowLeft, FaLock } from 'react-icons/fa';
import api from '../../utils/api';
import ProjectSidebar from '../../components/ProjectSidebar';
import FileCard from '../../components/FileCard';

const FolderView = () => {
  const { id, phase, subfolder } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = currentUser?.id || currentUser?._id;
  const isManager = currentUser?.role === 'MANAGER';
  const isUserRoute = location.pathname.includes('/dashboard-user');

  const getCorrectPath = () => {
    let root = phase;
    if (phase === 'design') root = 'designs';
    return subfolder ? `${root}/${subfolder}` : root;
  };

  const currentPath = getCorrectPath(); 

  useEffect(() => {
    fetchData();
  }, [id, phase, subfolder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const projRes = await api.get(`/projects/${id}`);
      setProject(projRes.data);

      const actRes = await api.get(`/projects/${id}/activity`);
      
      const filteredFiles = actRes.data.filter(log => {
        if (log.action !== 'UPLOAD_FILE') return false;
        
        // 🛠️ THE FIX: Smart Path Normalization
        const normalize = (path) => path?.toLowerCase().replace(/\/+$/, "").replace(/^designs/, "design");
        
        const dbFolder = normalize(log.meta?.folder || "");
        const targetFolder = normalize(currentPath || "");

        return dbFolder === targetFolder;
      });

      setFiles(filteredFiles);
    } catch (err) {
      console.error("Fetch Data Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = () => {
    if (!project) return false;
    if (isManager) return true;

    let assignedUsers = [];
    if (phase === 'scripts') assignedUsers = project.assignedUsers?.scriptWriters || [];
    else if (phase === 'design') assignedUsers = project.assignedUsers?.designers || [];
    else if (phase === 'development') assignedUsers = project.assignedUsers?.developers || [];

    const myIdStr = String(currentUserId);
    return assignedUsers.some(u => String(u._id || u) === myIdStr);
  };

  const canEdit = checkPermission();

  const handleUpload = async (e) => {
    if (!canEdit) return; 
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    
    // 🚨 THE FIX: Text fields MUST be appended before the file for Multer
    formData.append('folder', currentPath); 
    formData.append('file', file); 

    try {
      // 🚨 THE FIX: Do NOT set manual headers here. Axios handles it automatically.
      await api.post(`/projects/${id}/files`, formData);
      fetchData(); 
    } catch (err) {
      console.error("Upload Error:", err);
      alert(err.response?.data?.error || err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (activityId) => {
    if (!window.confirm("Delete this file permanently?")) return;
    try {
      await api.delete(`/projects/files/${activityId}`);
      setFiles(prev => prev.filter(f => f._id !== activityId));
    } catch (err) {
      alert("Failed to delete file. You might not have permission.");
    }
  };

  const getPrefix = () => isUserRoute ? '/dashboard-user' : '/dashboard-manager';

  const handleFolderSelect = (newPhase, newSubfolder = null) => {
    if (newPhase === 'overview') {
      navigate(`${getPrefix()}/projects/${id}`);
    } else {
      navigate(`${getPrefix()}/projects/${id}/${newPhase}/${newSubfolder || ''}`);
    }
  };

  if (!project) return <div className="bg-black h-screen text-white p-10 flex items-center justify-center"><FaSpinner className="animate-spin mr-2"/> Loading...</div>;

  return (
    <div className="flex h-screen bg-black text-gray-100 overflow-hidden font-sans">
      <ProjectSidebar 
        projectId={id} 
        activePhase={phase} 
        activeSubfolder={subfolder} 
        onSelectFolder={handleFolderSelect} 
        onBack={isUserRoute ? () => navigate('/dashboard-user/projects') : null}
        userRole={currentUser.role}
      />

      <div className="flex-1 flex flex-col overflow-auto">
        <header className="px-8 py-4 border-b border-gray-800 flex items-center justify-between bg-[#0b0c10]">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <button onClick={() => navigate(`${getPrefix()}/projects/${id}`)} className="hover:text-white transition-colors">
              <FaArrowLeft />
            </button>
            <span className="hover:text-white cursor-pointer" onClick={() => navigate(getPrefix())}>DevRoot</span>
            <span>/</span>
            <span className="text-white font-bold cursor-pointer" onClick={() => navigate(`${getPrefix()}/projects/${id}`)}>{project.name}</span>
            <span>/</span>
            <span className="capitalize">{phase}</span>
            {subfolder && <span className="text-white font-bold">/ {subfolder}</span>}
          </div>

          <div className="relative flex items-center gap-3">
            {!canEdit && (
              <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 px-3 py-1.5 rounded text-xs text-gray-400 font-bold uppercase">
                 <FaLock size={10} /> Read Only
              </div>
            )}

            {canEdit && (
              <>
                <input type="file" id="fileUpload" className="hidden" onChange={handleUpload} disabled={uploading} />
                <label htmlFor="fileUpload" className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold cursor-pointer transition-all shadow-lg shadow-blue-600/20 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {uploading ? <FaSpinner className="animate-spin"/> : <FaCloudUploadAlt />}
                  {uploading ? 'Uploading...' : 'Upload File'}
                </label>
              </>
            )}
          </div>
        </header>

        <div className="p-8 space-y-6">
          <h1 className="text-2xl font-bold text-white capitalize">
            {subfolder || phase} <span className="text-gray-500 text-lg font-normal">Files</span>
          </h1>

          {loading ? (
            <div className="flex items-center gap-3 text-gray-500"><FaSpinner className="animate-spin"/> Scanning...</div>
          ) : files.length === 0 ? (
             <div className="border-2 border-dashed border-gray-800 rounded-2xl h-80 flex flex-col items-center justify-center text-gray-600 bg-[#0f1115]">
               <FaFile className="text-5xl mb-4 opacity-10" />
               <p className="text-lg">No files found in <span className="text-blue-500/50 font-mono">{currentPath}</span></p>
               {canEdit ? (
                 <p className="text-sm mt-2 opacity-50">Upload a file to get started.</p>
               ) : (
                 <p className="text-sm mt-2 opacity-50">Nothing has been uploaded yet.</p>
               )}
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {files.map((file) => (
                <FileCard 
                  key={file._id} 
                  file={file} 
                  onDelete={canEdit ? handleDeleteFile : null} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderView;