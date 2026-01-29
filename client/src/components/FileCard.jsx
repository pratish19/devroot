import { useEffect, useState } from 'react';
import { FaFileImage, FaFileCode, FaTrash, FaDownload, FaEye } from 'react-icons/fa';
import api from '../utils/api';

const FileCard = ({ file, onDelete }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const isImage = file.meta?.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  useEffect(() => {
    // 1. Get PREVIEW Link (For viewing)
    const fetchPreview = async () => {
      if (file.meta?.cloudPath) {
        try {
          const res = await api.get(`/projects/files/url?path=${encodeURIComponent(file.meta.cloudPath)}`);
          setPreviewUrl(res.data.url);
        } catch (err) {
          console.error("Failed to load preview", err);
        }
      }
    };
    fetchPreview();
  }, [file]);

  /// ⭐ UPDATED: Handle Force Download with Filename
 // ... inside FileCard.jsx

  const handleDownload = async (e) => {
    e.stopPropagation();

    // 🛑 SAFETY CHECK: Ensure we actually have a path to download
    const cloudPath = file.meta?.cloudPath;
    if (!cloudPath) {
      console.error("❌ Corrupted File Record:", file);
      alert("Cannot download: This file record is missing its cloud path (it might be an old test file).");
      return;
    }

    try {
      // 1. Get clean filename
      const originalName = file.meta?.fileName?.split('-').slice(1).join('-') || file.meta.fileName;

      // 2. Request link
      const res = await api.get(`/projects/files/url`, {
        params: {
          path: cloudPath, // Use the variable we checked above
          download: 'true',
          filename: originalName 
        }
      });
      
      // 3. Trigger Download
      const link = document.createElement('a');
      link.href = res.data.url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Download Error Details:", err.response?.data || err.message);
      alert("Download failed. Check console for details.");
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${file.meta?.fileName}"?`)) {
      onDelete(file._id);
    }
  };

  return (
    <div 
      className="relative group bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer shadow-md hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => previewUrl && window.open(previewUrl, '_blank')}
    >
      {/* PREVIEW AREA */}
      <div className="aspect-square bg-gray-800 flex items-center justify-center relative overflow-hidden">
        {isImage && previewUrl ? (
          <img 
            src={previewUrl} 
            alt="preview" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        ) : (
          <div className="text-gray-600 group-hover:text-blue-400 transition-colors">
            {isImage ? <FaFileImage className="text-4xl" /> : <FaFileCode className="text-4xl" />}
          </div>
        )}

        {/* OVERLAY ACTIONS */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-3 animate-fadeIn backdrop-blur-sm">
            
            {/* Download Button */}
            <button 
              onClick={handleDownload} // 👈 Uses new logic
              title="Download"
              className="p-2.5 bg-gray-700 rounded-full text-white hover:bg-blue-600 hover:scale-110 transition-all shadow-lg"
            >
              <FaDownload size={12} />
            </button>
            
            {/* Delete Button */}
            <button 
              onClick={handleDelete}
              title="Delete"
              className="p-2.5 bg-gray-700 rounded-full text-red-400 hover:bg-red-600 hover:text-white hover:scale-110 transition-all shadow-lg"
            >
              <FaTrash size={12} />
            </button>
          </div>
        )}
      </div>

      {/* INFO AREA */}
      <div className="p-3 bg-gray-900 border-t border-gray-800">
        <p className="text-xs text-gray-200 font-medium truncate">
          {file.meta?.fileName?.split('-').slice(1).join('-') || "Unknown File"}
        </p>
      </div>
    </div>
  );
};

export default FileCard;