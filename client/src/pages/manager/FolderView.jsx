import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaFile, FaSpinner } from 'react-icons/fa';
import api from '../../utils/api';
import ProjectSidebar from '../../components/ProjectSidebar';
import FileCard from '../../components/FileCard'; // ⭐ Import New Component

const FolderView = () => {
  const { id, phase, subfolder } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id, phase, subfolder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const projRes = await api.get('/projects');
      const found = projRes.data.find(p => p._id === id);
      setProject(found);

      const actRes = await api.get(`/projects/${id}/activity`);
      
      const filteredFiles = actRes.data.filter(log => {
        if (log.action !== 'UPLOAD') return false;
        let targetFolderRoot = phase === 'design' ? 'designs' : phase;
        const expectedPath = subfolder ? `${targetFolderRoot}/${subfolder}` : targetFolderRoot;
        return log.meta?.folderPath?.startsWith(expectedPath);
      });

      setFiles(filteredFiles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('projectId', id);
    
    let folderPath = phase === 'design' ? 'designs' : phase;
    if (subfolder) folderPath += `/${subfolder}`;
    else if (phase === 'development') folderPath += '/builds';

    formData.append('folderPath', folderPath);
    formData.append('file', file);

    try {
      await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchData(); 
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ⭐ NEW: Handle Deletion logic passed down to Card
  const handleDeleteFile = async (activityId) => {
    try {
      await api.delete(`/projects/files/${activityId}`);
      // Remove from UI instantly
      setFiles(prev => prev.filter(f => f._id !== activityId));
    } catch (err) {
      alert("Failed to delete file");
      console.error(err);
    }
  };

  const handleFolderSelect = (newPhase, newSubfolder = null) => {
    if (newPhase === 'overview') {
      navigate(`/dashboard-manager/projects/${id}`);
    } else {
      navigate(`/dashboard-manager/projects/${id}/${newPhase}/${newSubfolder || ''}`);
    }
  };

  if (!project) return <div className="bg-black h-screen text-white p-10">Loading...</div>;

  return (
    <div className="flex h-screen bg-black text-gray-100 overflow-hidden font-sans">
      <ProjectSidebar projectId={id} activePhase={phase} onSelectFolder={handleFolderSelect} />

      <div className="flex-1 flex flex-col overflow-auto">
        <header className="px-8 py-4 border-b border-gray-800 flex items-center gap-2 text-sm text-gray-500">
          <span className="hover:text-white cursor-pointer" onClick={() => navigate('/dashboard-manager')}>DevRoot</span>
          <span>/</span>
          <span className="text-white font-bold cursor-pointer" onClick={() => navigate(`/dashboard-manager/projects/${id}`)}>{project.name}</span>
          <span>/</span>
          <span className="capitalize">{phase}</span>
          {subfolder && <span className="text-white font-bold">/ {subfolder}</span>}
        </header>

        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white capitalize">
              {subfolder || phase} <span className="text-gray-500 text-lg font-normal">Files</span>
            </h1>
            
            <div className="relative">
               <input type="file" id="fileUpload" className="hidden" onChange={handleUpload} disabled={uploading} />
               <label htmlFor="fileUpload" className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold cursor-pointer transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                 {uploading ? <FaSpinner className="animate-spin"/> : <FaCloudUploadAlt />}
                 {uploading ? 'Uploading...' : 'Upload File'}
               </label>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500">Scanning folder contents...</p>
          ) : files.length === 0 ? (
             <div className="border-2 border-dashed border-gray-800 rounded-xl h-64 flex flex-col items-center justify-center text-gray-600">
               <FaFile className="text-4xl mb-4 opacity-20" />
               <p>No files found.</p>
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map((file) => (
                // ⭐ USE NEW SMART CARD HERE
                <FileCard 
                  key={file._id} 
                  file={file} 
                  onDelete={handleDeleteFile} 
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