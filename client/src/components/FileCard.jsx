import { useEffect, useState } from 'react';
import { FaFileImage, FaFileCode, FaTrash, FaDownload } from 'react-icons/fa';
import api from '../utils/api';

const FileCard = ({ file, onDelete }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // Safety check for meta
  const meta = file.meta || {};
  const isImage = meta.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  useEffect(() => {
    const fetchPreview = async () => {
      if (meta.cloudPath && isImage) {
        try {
          const res = await api.get(`/projects/files/url?path=${encodeURIComponent(meta.cloudPath)}`);
          setPreviewUrl(res.data.url);
        } catch (err) {
          console.error("Failed to load preview", err);
        }
      }
    };
    fetchPreview();
  }, [file]);

  // 🧠 SMART NAME RESCUE
  // This logic finds the name even if 'meta' is empty (fixing "Unknown File")
  const getDisplayName = () => {
    let name = "Unknown File";

    // 1. Try the Metadata (Best source)
    if (meta.fileName) {
      name = meta.fileName;
    } 
    // 2. Fallback: Extract from 'details' (e.g. "Uploaded image.png to ...")
    else if (file.details?.startsWith("Uploaded ")) {
      // Logic: Take the text between "Uploaded " and " to"
      const parts = file.details.split(' to ');
      name = parts[0].replace("Uploaded ", "");
    }

    // 3. Clean up the Timestamp (e.g. "17123456-myImage.png" -> "myImage.png")
    // This regex looks for "numbers-text" at the start
    if (/^\d+-/.test(name)) {
      return name.replace(/^\d+-/, '');
    }
    
    return name;
  };

  const displayName = getDisplayName();

  const handleDownload = async (e) => {
    e.stopPropagation();

    // If cloudPath is missing (old files), we can't download
    if (!meta.cloudPath) {
      alert("Cannot download: This is an old file record missing cloud data.");
      return;
    }

    try {
      const res = await api.get(`/projects/files/url`, {
        params: {
          path: meta.cloudPath,
          download: 'true',
          filename: displayName // Use the clean name for download
        }
      });
      
      const link = document.createElement('a');
      link.href = res.data.url;
      link.setAttribute('download', displayName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Download failed. Check console.");
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${displayName}"?`)) {
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
            alt={displayName} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        ) : (
          <div className="text-gray-600 group-hover:text-blue-400 transition-colors flex flex-col items-center gap-2">
            {isImage ? <FaFileImage className="text-4xl" /> : <FaFileCode className="text-4xl" />}
            {/* Show extension for non-images */}
            <span className="text-xs font-mono uppercase bg-gray-800 px-1 rounded">
              {displayName.split('.').pop()}
            </span>
          </div>
        )}

        {/* OVERLAY ACTIONS */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-3 animate-fadeIn backdrop-blur-sm">
            <button 
              onClick={handleDownload}
              title="Download"
              className="p-2.5 bg-gray-700 rounded-full text-white hover:bg-blue-600 hover:scale-110 transition-all shadow-lg"
            >
              <FaDownload size={12} />
            </button>
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

      {/* INFO AREA - Shows "As Is" Title */}
      <div className="p-3 bg-gray-900 border-t border-gray-800">
        <p className="text-xs text-gray-200 font-medium truncate" title={displayName}>
          {displayName}
        </p>
      </div>
    </div>
  );
};

export default FileCard;