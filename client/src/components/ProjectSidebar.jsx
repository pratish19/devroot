import { useState, useEffect } from 'react';
import { 
  FaFolder, 
  FaFolderOpen, 
  FaChevronRight, 
  FaChevronDown, 
  FaCircle,
  FaChartPie,
  FaArrowLeft
} from 'react-icons/fa';

// Added 'activeSubfolder' and 'onBack' props
const ProjectSidebar = ({ projectId, activePhase, activeSubfolder, onSelectFolder, onBack, userRole = 'MANAGER' }) => {
  const [isDesignOpen, setDesignOpen] = useState(true);

  // Auto-open design folder if we are inside it
  useEffect(() => {
    if (activePhase === 'design') setDesignOpen(true);
  }, [activePhase]);

  const SidebarItem = ({ icon, name, isOpen, hasChildren, onClick, isActive }) => (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors text-sm mb-1 ${
        isActive 
          ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/20' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <div className="w-4 flex justify-center">
        {hasChildren && (
          isOpen ? <FaChevronDown className="text-[10px]" /> : <FaChevronRight className="text-[10px]" />
        )}
      </div>
      <span className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}>
        {icon}
      </span>
      <span>{name}</span>
    </div>
  );

  const SubItem = ({ name, path }) => {
    // ✅ DYNAMIC HIGHLIGHT LOGIC
    const isSubActive = activePhase === 'design' && activeSubfolder === path;

    return (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onSelectFolder('design', path);
        }}
        className={`flex items-center gap-3 pl-12 py-1.5 cursor-pointer text-xs transition-colors ${
          isSubActive 
            ? 'text-white font-bold bg-white/5 rounded-r border-l-2 border-blue-500' 
            : 'text-gray-500 hover:text-white'
        }`}
      >
        {!isSubActive && <FaCircle className="text-[4px]" />}
        <span className="capitalize">{name}</span>
      </div>
    );
  };

  return (
    <div className="w-64 bg-[#0b0c10] border-r border-gray-800 flex flex-col h-full flex-shrink-0 font-sans">
      
      {/* ⭐ HEADER (Different for User vs Manager) */}
      <div className="p-4 border-b border-gray-800 mb-2">
        {onBack ? (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold"
          >
            <FaArrowLeft /> Back to Projects
          </button>
        ) : (
          <h2 className="text-white font-bold text-lg tracking-wide">DevRoot</h2>
        )}
      </div>

      <div className="p-2 flex-1 overflow-y-auto">
        
        {/* OVERVIEW */}
        <SidebarItem 
          name="Overview" 
          icon={<FaChartPie />}
          onClick={() => onSelectFolder('overview')}
          isActive={activePhase === 'overview'}
        />

        <div className="my-2 border-t border-gray-800 mx-2"></div>

        {/* 1. SCRIPT */}
        <SidebarItem 
          name="Script Development" 
          icon={activePhase === 'scripts' ? <FaFolderOpen /> : <FaFolder />}
          onClick={() => onSelectFolder('scripts')}
          isActive={activePhase === 'scripts'}
        />

        {/* 2. DESIGN */}
        <div>
          <SidebarItem 
            name="Design" 
            icon={activePhase === 'design' || isDesignOpen ? <FaFolderOpen /> : <FaFolder />}
            hasChildren={true}
            isOpen={isDesignOpen}
            onClick={() => setDesignOpen(!isDesignOpen)}
            isActive={activePhase === 'design'}
          />
          
          {isDesignOpen && (
            <div className="space-y-0.5 mb-2 transition-all">
              {['assets', 'raw', 'spine', 'videos', 'sounds', 'links'].map((sub) => (
                <SubItem key={sub} name={sub} path={sub} />
              ))}
            </div>
          )}
        </div>

        {/* 3. DEV */}
        <SidebarItem 
          name="Development" 
          icon={activePhase === 'development' ? <FaFolderOpen /> : <FaFolder />}
          onClick={() => onSelectFolder('development')}
          isActive={activePhase === 'development'}
        />
      </div>
    </div>
  );
};

export default ProjectSidebar;