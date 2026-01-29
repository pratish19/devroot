import { useState } from 'react';
import { 
  FaFolder, 
  FaFolderOpen, 
  FaChevronRight, 
  FaChevronDown, 
  FaCircle,
  FaChartPie // Icon for Overview
} from 'react-icons/fa';

const ProjectSidebar = ({ projectId, activePhase, onSelectFolder }) => {
  const [isDesignOpen, setDesignOpen] = useState(true);

  // Helper for consistent folder styling
  const SidebarItem = ({ icon, name, isOpen, hasChildren, onClick, isActive }) => (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors text-sm mb-1 ${
        isActive 
          ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/20' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {/* Arrow for collapsible items */}
      <div className="w-4 flex justify-center">
        {hasChildren && (
          isOpen ? <FaChevronDown className="text-[10px]" /> : <FaChevronRight className="text-[10px]" />
        )}
      </div>
      
      {/* Icon */}
      <span className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}>
        {icon}
      </span>
      
      {/* Label */}
      <span>{name}</span>
    </div>
  );

  const SubItem = ({ name, path }) => (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onSelectFolder('design', path);
      }}
      className={`flex items-center gap-3 pl-12 py-1.5 cursor-pointer text-xs transition-colors ${
        activePhase === 'design' && path === 'assets' // You can pass subfolder prop to highlight specific subitem too
          ? 'text-white font-medium' 
          : 'text-gray-500 hover:text-white'
      }`}
    >
      <FaCircle className="text-[4px]" />
      <span className="capitalize">{name}</span>
    </div>
  );

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full flex-shrink-0">
      <div className="p-4 border-b border-gray-800 mb-2">
        <h2 className="text-white font-bold text-lg tracking-wide">DevRoot</h2>
      </div>

      <div className="p-2 flex-1 overflow-y-auto">
        
        {/* ⭐ NEW: OVERVIEW TAB */}
        <SidebarItem 
          name="Overview" 
          icon={<FaChartPie />}
          onClick={() => onSelectFolder('overview')}
          isActive={activePhase === 'overview'}
        />

        <div className="my-2 border-t border-gray-800 mx-2"></div>

        {/* 1. Script Development */}
        <SidebarItem 
          name="Script Development" 
          icon={activePhase === 'scripts' ? <FaFolderOpen /> : <FaFolder />}
          onClick={() => onSelectFolder('scripts')}
          isActive={activePhase === 'scripts'}
        />

        {/* 2. Design (Collapsible) */}
        <div>
          <SidebarItem 
            name="Design" 
            icon={activePhase === 'design' || isDesignOpen ? <FaFolderOpen /> : <FaFolder />}
            hasChildren={true}
            isOpen={isDesignOpen}
            onClick={() => setDesignOpen(!isDesignOpen)}
            isActive={activePhase === 'design'}
          />
          
          {/* Subfolders */}
          {isDesignOpen && (
            <div className="space-y-0.5 mb-2">
              {['assets', 'raw', 'spine', 'videos', 'sounds', 'links'].map((sub) => (
                <SubItem key={sub} name={sub} path={sub} />
              ))}
            </div>
          )}
        </div>

        {/* 3. Development */}
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