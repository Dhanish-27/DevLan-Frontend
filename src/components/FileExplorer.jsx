import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Edit2, Trash2, FilePlus, FolderPlus, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../api';
import { ENDPOINTS } from '../endpoints';
import { useIDEStore } from '../store/useIDEStore';
import ContextMenu from './ContextMenu';
import toast from 'react-hot-toast';

const InlineInput = ({ initialValue = '', onSubmit, onCancel, type = 'file' }) => {
    const [val, setVal] = useState(initialValue);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            if (initialValue) {
                // Select only filename without extension
                const dotIndex = initialValue.lastIndexOf('.');
                if (dotIndex > 0) {
                    inputRef.current.setSelectionRange(0, dotIndex);
                } else {
                    inputRef.current.select();
                }
            }
        }
    }, [initialValue]);

    return (
        <div className="flex items-center gap-2 py-1 px-2 ml-4">
            {type === 'folder' ? <Folder size={16} color="var(--accent)" /> : <File size={16} color="var(--text-secondary)" />}
            <input
                ref={inputRef}
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        if (val.trim()) onSubmit(val.trim());
                        else onCancel();
                    }
                    if (e.key === 'Escape') onCancel();
                }}
                onBlur={() => {
                    if (val.trim()) onSubmit(val.trim());
                    else onCancel();
                }}
                className="bg-[var(--bg-hover)] border border-[var(--accent)] text-[var(--text-primary)] text-sm rounded px-1 outline-none w-full"
            />
        </div>
    );
};

const TreeNode = ({ node, currentPath, onAction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { activeFile, openFile } = useIDEStore();
    const [contextMenu, setContextMenu] = useState(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    const isRoot = currentPath === null;
    const nodePath = isRoot ? '' : (currentPath ? `${currentPath}/${node.name}` : node.name);
    
    // Auto-open if active file is inside
    useEffect(() => {
        if (!isRoot && activeFile && activeFile.startsWith(nodePath + '/') && node.type === 'folder') {
            setIsOpen(true);
        }
    }, [activeFile, nodePath, isRoot, node.type]);

    const handleClick = (e) => {
        e.stopPropagation();
        if (node.type === 'folder') {
            setIsOpen(!isOpen);
        } else {
            openFile(nodePath);
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const isActive = activeFile === nodePath;

    return (
        <div style={{ marginLeft: isRoot ? '0' : '0.5rem' }}>
            {/* The Node Itself */}
            {!isRoot && !isRenaming && (
                <div 
                    className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer select-none transition-colors
                        ${isActive ? 'bg-[var(--accent-glow)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'}
                    `}
                    onClick={handleClick}
                    onContextMenu={handleContextMenu}
                >
                    <div className="flex items-center gap-1 overflow-hidden">
                        {node.type === 'folder' && (
                            <span className="opacity-70 flex-shrink-0">
                                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </span>
                        )}
                        <span className="flex-shrink-0 ml-1">
                            {node.type === 'folder' ? (
                                <Folder size={14} color="var(--accent)" />
                            ) : (
                                <File size={14} className={isActive ? 'text-[var(--accent)]' : ''} />
                            )}
                        </span>
                        <span className="text-sm truncate ml-1 leading-tight">{node.name}</span>
                    </div>
                </div>
            )}

            {/* Rename Input */}
            {!isRoot && isRenaming && (
                <InlineInput 
                    initialValue={node.name}
                    type={node.type}
                    onSubmit={(newName) => {
                        setIsRenaming(false);
                        if (newName !== node.name) onAction('rename', nodePath, newName);
                    }}
                    onCancel={() => setIsRenaming(false)}
                />
            )}

            {/* Folder Children */}
            {node.type === 'folder' && (isRoot || isOpen) && (
                <div>
                    {node.children?.map((child, idx) => (
                        <TreeNode 
                            key={`${nodePath}-${child.name}-${idx}`} 
                            node={child} 
                            currentPath={nodePath} 
                            onAction={onAction}
                        />
                    ))}

                    {/* Creation Inputs at the bottom of the folder */}
                    {isCreatingFile && (
                        <InlineInput 
                            type="file"
                            onSubmit={(name) => {
                                setIsCreatingFile(false);
                                onAction('createFile', nodePath, name);
                            }}
                            onCancel={() => setIsCreatingFile(false)}
                        />
                    )}
                    {isCreatingFolder && (
                        <InlineInput 
                            type="folder"
                            onSubmit={(name) => {
                                setIsCreatingFolder(false);
                                onAction('createFolder', nodePath, name);
                            }}
                            onCancel={() => setIsCreatingFolder(false)}
                        />
                    )}
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu
                    position={contextMenu}
                    onClose={() => setContextMenu(null)}
                    items={[
                        ...(node.type === 'folder' ? [
                            { label: 'New File', icon: FilePlus, onClick: () => { setIsOpen(true); setIsCreatingFile(true); } },
                            { label: 'New Folder', icon: FolderPlus, onClick: () => { setIsOpen(true); setIsCreatingFolder(true); } },
                            { type: 'separator' }
                        ] : []),
                        { label: 'Rename', icon: Edit2, onClick: () => setIsRenaming(true), shortcut: 'F2' },
                        { label: 'Delete', icon: Trash2, danger: true, onClick: () => onAction('delete', nodePath) },
                        { type: 'separator' },
                        { label: 'Copy Path', icon: Copy, onClick: () => {
                            navigator.clipboard.writeText(nodePath);
                            toast.success("Path copied to clipboard");
                        }}
                    ]}
                />
            )}
        </div>
    );
};

const FileExplorer = ({ repositoryId }) => {
    const [tree, setTree] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCreatingRootFile, setIsCreatingRootFile] = useState(false);
    const [isCreatingRootFolder, setIsCreatingRootFolder] = useState(false);

    const fetchTree = async () => {
        try {
            setLoading(true);
            const res = await api.get(ENDPOINTS.files.tree, { params: { repository_id: repositoryId } });
            setTree(res.data);
        } catch (err) {
            console.error(err);
            toast.error(`Failed to load file tree: ${err.response?.status} ${err.response?.data?.detail || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (repositoryId) fetchTree();
    }, [repositoryId]);

    const handleAction = async (action, targetPath, newName) => {
        try {
            if (action === 'createFile' || action === 'createFolder') {
                const endpoint = action === 'createFile' ? ENDPOINTS.files.createFile : ENDPOINTS.files.createFolder;
                await api.post(endpoint, {
                    repository_id: repositoryId,
                    directory: targetPath, // targetPath is the parent directory
                    name: newName
                });
                toast.success(`${action === 'createFile' ? 'File' : 'Folder'} created.`);
                fetchTree();
            } 
            else if (action === 'rename') {
                await api.put(ENDPOINTS.files.rename, {
                    repository_id: repositoryId,
                    old_path: targetPath,
                    new_name: newName
                });
                // TODO: Update active tab path if renamed file was open
                fetchTree();
            }
            else if (action === 'delete') {
                if (!confirm(`Are you sure you want to delete ${targetPath}?`)) return;
                await api.delete(ENDPOINTS.files.delete, {
                    data: { repository_id: repositoryId, path: targetPath }
                });
                toast.success('Deleted successfully.');
                fetchTree();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    if (loading && !tree) {
        return <div className="p-4 text-xs text-[var(--text-secondary)] animate-pulse">Loading explorer...</div>;
    }

    return (
        <div className="h-full flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)] w-full">
            <div className="flex items-center justify-between p-3 border-b border-[var(--border-color)]">
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Explorer</span>
                <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                    <button onClick={() => setIsCreatingRootFile(true)} title="New File" className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded"><FilePlus size={14} /></button>
                    <button onClick={() => setIsCreatingRootFolder(true)} title="New Folder" className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded"><FolderPlus size={14} /></button>
                    <button onClick={fetchTree} title="Refresh" className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded"><RefreshCw size={14} /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 outline-none select-none" tabIndex={0}>
                {tree && (
                    <TreeNode 
                        node={tree} 
                        currentPath={null} 
                        onAction={handleAction}
                    />
                )}
                
                {/* Root level creation */}
                {isCreatingRootFile && (
                    <InlineInput 
                        type="file"
                        onSubmit={(name) => {
                            setIsCreatingRootFile(false);
                            handleAction('createFile', '', name);
                        }}
                        onCancel={() => setIsCreatingRootFile(false)}
                    />
                )}
                {isCreatingRootFolder && (
                    <InlineInput 
                        type="folder"
                        onSubmit={(name) => {
                            setIsCreatingRootFolder(false);
                            handleAction('createFolder', '', name);
                        }}
                        onCancel={() => setIsCreatingRootFolder(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default FileExplorer;
