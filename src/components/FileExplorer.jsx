import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FilePlus, FolderPlus, Edit2, Trash2 } from 'lucide-react';
import api from '../api';
import { ENDPOINTS } from '../endpoints';

const TreeNode = ({ node, currentPath, onFileClick, onAction }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // root node has no currentPath, so we build paths relative to root
    const isRoot = currentPath === null;
    // Don't include root name in the path string
    const nodePath = isRoot ? '' : (currentPath ? `${currentPath}/${node.name}` : node.name);
    
    const toggleOpen = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleClick = (e) => {
        e.stopPropagation();
        if (node.type === 'folder') {
            setIsOpen(!isOpen);
        } else {
            onFileClick(nodePath);
        }
    };

    const handleAction = (e, action) => {
        e.stopPropagation();
        onAction(action, node, nodePath);
    };

    return (
        <div style={{ marginLeft: isRoot ? '0' : '1rem' }}>
            <div 
                className="flex items-center justify-between py-1 px-2 hover:bg-[rgba(255,255,255,0.05)] rounded cursor-pointer group"
                onClick={handleClick}
            >
                <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {node.type === 'folder' && (
                        <span onClick={toggleOpen} className="text-[var(--text-secondary)]">
                            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                    )}
                    {node.type === 'folder' ? (
                        <Folder size={16} color="var(--accent)" />
                    ) : (
                        <span style={{ marginLeft: node.type === 'file' ? '1.5rem' : '0' }}>
                            <File size={16} color="var(--text-secondary)" />
                        </span>
                    )}
                    <span>{node.name}</span>
                </div>

                {!isRoot && (
                    <div className="hidden group-hover:flex items-center gap-2 opacity-70">
                        {node.type === 'folder' && (
                            <>
                                <button onClick={(e) => handleAction(e, 'createFile')} title="New File" className="hover:text-[var(--accent)]"><FilePlus size={14} /></button>
                                <button onClick={(e) => handleAction(e, 'createFolder')} title="New Folder" className="hover:text-[var(--accent)]"><FolderPlus size={14} /></button>
                            </>
                        )}
                        <button onClick={(e) => handleAction(e, 'rename')} title="Rename" className="hover:text-[var(--accent)]"><Edit2 size={14} /></button>
                        <button onClick={(e) => handleAction(e, 'delete')} title="Delete" className="hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                )}
                {isRoot && (
                    <div className="hidden group-hover:flex items-center gap-2 opacity-70">
                        <button onClick={(e) => handleAction(e, 'createFile')} title="New File" className="hover:text-[var(--accent)]"><FilePlus size={14} /></button>
                        <button onClick={(e) => handleAction(e, 'createFolder')} title="New Folder" className="hover:text-[var(--accent)]"><FolderPlus size={14} /></button>
                    </div>
                )}
            </div>
            
            {node.type === 'folder' && (isRoot || isOpen) && node.children && (
                <div>
                    {node.children.map((child, idx) => (
                        <TreeNode 
                            key={idx} 
                            node={child} 
                            currentPath={nodePath} 
                            onFileClick={onFileClick} 
                            onAction={onAction}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const FileExplorer = ({ repositoryId, onFileSelect }) => {
    const [tree, setTree] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTree = async () => {
        try {
            setLoading(true);
            const res = await api.get(ENDPOINTS.files.tree, {
                params: { repository_id: repositoryId }
            });
            setTree(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to load file tree.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (repositoryId) {
            fetchTree();
        }
    }, [repositoryId]);

    const handleAction = async (action, node, nodePath) => {
        if (action === 'createFile' || action === 'createFolder') {
            const name = prompt(`Enter name for new ${action === 'createFile' ? 'file' : 'folder'}:`);
            if (!name) return;

            const endpoint = action === 'createFile' ? ENDPOINTS.files.createFile : ENDPOINTS.files.createFolder;
            
            try {
                await api.post(endpoint, {
                    repository_id: repositoryId,
                    directory: nodePath,
                    name: name
                });
                fetchTree();
            } catch (err) {
                alert(`Error creating: ${err.response?.data?.message || err.message}`);
            }
        } 
        else if (action === 'rename') {
            const newName = prompt('Enter new name:', node.name);
            if (!newName || newName === node.name) return;

            try {
                await api.put(ENDPOINTS.files.rename, {
                    repository_id: repositoryId,
                    old_path: nodePath,
                    new_name: newName
                });
                fetchTree();
            } catch (err) {
                alert(`Error renaming: ${err.response?.data?.message || err.message}`);
            }
        }
        else if (action === 'delete') {
            if (!confirm(`Are you sure you want to delete ${node.name}?`)) return;

            try {
                await api.delete(ENDPOINTS.files.delete, {
                    data: {
                        repository_id: repositoryId,
                        path: nodePath
                    }
                });
                fetchTree();
            } catch (err) {
                alert(`Error deleting: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    if (loading) return <div className="p-4 text-[var(--text-secondary)]">Loading files...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (!tree) return null;

    return (
        <div className="glass-panel overflow-y-auto h-full p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-lg mb-4 font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
                <Folder size={20} color="var(--accent)" /> Files
            </h3>
            <TreeNode 
                node={tree} 
                currentPath={null} 
                onFileClick={onFileSelect} 
                onAction={handleAction}
            />
        </div>
    );
};

export default FileExplorer;
