import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderGit2, Terminal } from 'lucide-react';
import CopyButton from './CopyButton';

const CloneRepositoryModal = ({ isOpen, onClose, repository }) => {
    if (!repository) return null;
    
    // Fallback if the backend doesn't provide clone_url yet, but user expects it to be available
    const cloneUrl = repository.clone_url || "Clone URL not available.";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                        className="relative w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
                            <div className="flex items-center gap-2">
                                <FolderGit2 className="text-[var(--accent)]" size={20} />
                                <h3 className="font-semibold text-lg text-[var(--text-primary)]">Clone Repository</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <p className="text-sm text-[var(--text-secondary)] mb-4">
                                Clone <strong className="text-[var(--text-primary)] font-medium">{repository.name}</strong> to your local machine using the URL below.
                            </p>

                            <div className="flex items-stretch gap-2 mb-6">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Terminal size={16} className="text-[var(--text-muted)]" />
                                    </div>
                                    <input
                                        type="text"
                                        readOnly
                                        value={cloneUrl}
                                        className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                                    />
                                </div>
                                <CopyButton 
                                    text={cloneUrl} 
                                    className="px-4 py-2.5 h-auto border border-[var(--border-color)] rounded-lg shrink-0" 
                                />
                            </div>

                            <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-4">
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-[var(--text-primary)]">
                                    Command line instructions
                                </h4>
                                <pre className="text-xs text-[var(--text-secondary)] font-mono overflow-x-auto whitespace-pre-wrap">
git clone {cloneUrl}
                                </pre>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CloneRepositoryModal;
