import React, { useRef, useEffect } from 'react';
import { X, Circle } from 'lucide-react';
import { useIDEStore } from '../store/useIDEStore';
import ContextMenu from './ContextMenu';

const EditorTabs = () => {
    const { 
        openFiles, activeFile, 
        setActiveFile, closeFile, closeAllFiles, closeOtherFiles 
    } = useIDEStore();
    
    const [contextMenu, setContextMenu] = React.useState(null);
    const scrollRef = useRef(null);

    // Scroll active tab into view
    useEffect(() => {
        if (activeFile && scrollRef.current) {
            const activeTab = scrollRef.current.querySelector('[data-active="true"]');
            if (activeTab) {
                activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }
        }
    }, [activeFile]);

    const handleContextMenu = (e, path) => {
        e.preventDefault();
        setContextMenu({
            position: { x: e.clientX, y: e.clientY },
            path: path
        });
    };

    if (openFiles.length === 0) return null;

    const getMenuItems = (path) => [
        { label: 'Close', onClick: () => closeFile(path) },
        { label: 'Close Others', onClick: () => closeOtherFiles(path) },
        { label: 'Close All', onClick: () => closeAllFiles() },
        { type: 'separator' },
        { label: 'Copy Path', onClick: () => navigator.clipboard.writeText(path) }
    ];

    return (
        <div className="flex bg-[var(--bg-secondary)] border-b border-[var(--border-color)] overflow-x-auto select-none no-scrollbar" ref={scrollRef}>
            {openFiles.map(file => {
                const isActive = activeFile === file.path;
                const fileName = file.path.split('/').pop() || file.path;

                return (
                    <div
                        key={file.path}
                        data-active={isActive}
                        className={`group flex items-center min-w-fit max-w-[200px] h-9 px-3 border-r border-[var(--border-color)] border-t-2 cursor-pointer transition-colors
                            ${isActive 
                                ? 'bg-[var(--bg-primary)] border-t-[var(--accent)] text-[var(--text-primary)]' 
                                : 'bg-[var(--bg-secondary)] border-t-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                            }
                        `}
                        onClick={() => setActiveFile(file.path)}
                        onAuxClick={(e) => {
                            if (e.button === 1) closeFile(file.path); // Middle click close
                        }}
                        onContextMenu={(e) => handleContextMenu(e, file.path)}
                        title={file.path}
                    >
                        <span className="text-sm truncate mr-2">{fileName}</span>
                        
                        <div 
                            className="flex items-center justify-center w-5 h-5 rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors ml-auto"
                            onClick={(e) => {
                                e.stopPropagation();
                                closeFile(file.path);
                            }}
                        >
                            {file.isDirty ? (
                                <Circle size={10} className="fill-current text-yellow-500" />
                            ) : (
                                <X size={14} className={isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                            )}
                        </div>
                    </div>
                );
            })}

            {contextMenu && (
                <ContextMenu
                    position={contextMenu.position}
                    items={getMenuItems(contextMenu.path)}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
};

export default EditorTabs;
