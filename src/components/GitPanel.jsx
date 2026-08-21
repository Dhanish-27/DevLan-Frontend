import React, { useState, useEffect } from 'react';
import { GitBranch, Clock, AlertCircle, Plus, Check, RefreshCw, GitCommit } from 'lucide-react';
import api from '../api';
import { ENDPOINTS } from '../endpoints';
import toast from 'react-hot-toast';

const GitPanel = ({ repositoryId }) => {
    const [status, setStatus] = useState(null);
    const [branches, setBranches] = useState([]);
    const [currentBranch, setCurrentBranch] = useState('');
    const [loading, setLoading] = useState(true);
    const [commitMsg, setCommitMsg] = useState('');
    const [committing, setCommitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statusRes, branchesRes, branchRes] = await Promise.all([
                api.get(ENDPOINTS.repositories.status(repositoryId)).catch(() => ({ data: null })),
                api.get(ENDPOINTS.repositories.branches(repositoryId)).catch(() => ({ data: [] })),
                api.get(ENDPOINTS.repositories.currentBranch(repositoryId)).catch(() => ({ data: { branch: '' } }))
            ]);

            setStatus(statusRes.data);
            setBranches(branchesRes.data);
            setCurrentBranch(branchRes.data.branch);
        } catch (err) {
            console.error("Git fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (repositoryId) fetchData();
    }, [repositoryId]);

    const handleCommit = async () => {
        if (!commitMsg.trim()) {
            toast.error("Commit message required.");
            return;
        }
        setCommitting(true);
        try {
            await api.post(ENDPOINTS.repositories.commit(repositoryId), { message: commitMsg });
            toast.success("Changes committed successfully.");
            setCommitMsg('');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to commit.");
        } finally {
            setCommitting(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)]">
            <div className="flex items-center justify-between p-3 border-b border-[var(--border-color)]">
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Source Control</span>
                <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                    <button onClick={fetchData} title="Refresh" className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded"><RefreshCw size={14} /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Branch Info */}
                <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <GitBranch size={14} className="text-[var(--accent)]" />
                        <span className="font-semibold text-[var(--text-primary)]">{currentBranch || 'unknown'}</span>
                    </div>
                </div>

                {/* Commit Box */}
                <div className="p-3 border-b border-[var(--border-color)]">
                    <textarea 
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded p-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none"
                        placeholder="Message (Ctrl+Enter to commit)"
                        rows={3}
                        value={commitMsg}
                        onChange={e => setCommitMsg(e.target.value)}
                        onKeyDown={e => {
                            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleCommit();
                        }}
                    />
                    <button 
                        className="w-full mt-2 btn btn-primary py-1 text-sm flex items-center justify-center gap-2"
                        onClick={handleCommit}
                        disabled={committing || !status?.changed_files?.length}
                    >
                        {committing ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                        Commit
                    </button>
                </div>

                {/* Status List */}
                <div className="p-3">
                    <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-2">
                        Changes
                        <span className="bg-[var(--border-color)] text-[var(--text-primary)] px-2 py-0.5 rounded-full text-[10px]">
                            {status?.changed_files?.length || 0}
                        </span>
                    </h4>
                    
                    {loading ? (
                        <div className="text-xs text-[var(--text-secondary)] animate-pulse">Checking status...</div>
                    ) : status?.is_clean ? (
                        <div className="flex items-center gap-2 text-xs text-[var(--success)] p-2 bg-[rgba(16,185,129,0.1)] rounded">
                            <AlertCircle size={14} /> Working tree clean
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-1">
                            {status?.changed_files?.map((file, idx) => (
                                <li key={idx} className="text-sm py-1 px-2 hover:bg-[var(--bg-hover)] rounded cursor-pointer truncate" title={file}>
                                    {file}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GitPanel;
