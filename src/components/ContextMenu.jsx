import React, { useEffect, useRef } from 'react';

const ContextMenu = ({ items, position, onClose }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    if (!position) return null;

    // Ensure the menu doesn't overflow the viewport
    const style = {
        top: position.y,
        left: position.x
    };

    return (
        <div 
            ref={menuRef}
            className="fixed z-50 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl py-1 min-w-[200px]"
            style={style}
            onContextMenu={(e) => e.preventDefault()}
        >
            {items.map((item, index) => {
                if (item.type === 'separator') {
                    return <div key={`sep-${index}`} className="h-px bg-[var(--border-color)] my-1" />;
                }
                
                return (
                    <button
                        key={item.label}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors
                            ${item.danger 
                                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-500' 
                                : 'text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-white'
                            }
                        `}
                        onClick={(e) => {
                            e.stopPropagation();
                            item.onClick();
                            onClose();
                        }}
                    >
                        {item.icon && <item.icon size={14} />}
                        <span>{item.label}</span>
                        {item.shortcut && (
                            <span className="ml-auto text-xs opacity-60 font-mono">
                                {item.shortcut}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default ContextMenu;
