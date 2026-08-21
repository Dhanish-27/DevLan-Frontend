import { create } from 'zustand';

export const useIDEStore = create((set, get) => ({
    // File Explorer & Editor State
    activeFile: null,
    openFiles: [], // Array of objects { path: string, content: string, isDirty: boolean }
    
    // Panel Visibility
    isExplorerOpen: true,
    isGitPanelOpen: false,
    isAIPanelOpen: false,
    isSearchOpen: false,
    
    // Terminal State
    isTerminalOpen: false,
    
    // Actions
    setActiveFile: (path) => set({ activeFile: path }),
    
    openFile: (path, initialContent = '') => set((state) => {
        const existing = state.openFiles.find(f => f.path === path);
        if (existing) {
            return { activeFile: path };
        }
        return {
            openFiles: [...state.openFiles, { path, content: initialContent, isDirty: false }],
            activeFile: path
        };
    }),
    
    closeFile: (path) => set((state) => {
        const newFiles = state.openFiles.filter(f => f.path !== path);
        let newActive = state.activeFile;
        if (state.activeFile === path) {
            newActive = newFiles.length > 0 ? newFiles[newFiles.length - 1].path : null;
        }
        return { openFiles: newFiles, activeFile: newActive };
    }),

    closeAllFiles: () => set({ openFiles: [], activeFile: null }),
    
    closeOtherFiles: (path) => set((state) => {
        const file = state.openFiles.find(f => f.path === path);
        if (!file) return state;
        return { openFiles: [file], activeFile: path };
    }),
    
    setFileContent: (path, content, isDirty = true) => set((state) => ({
        openFiles: state.openFiles.map(f => 
            f.path === path ? { ...f, content, isDirty } : f
        )
    })),

    setFileSaved: (path) => set((state) => ({
        openFiles: state.openFiles.map(f => 
            f.path === path ? { ...f, isDirty: false } : f
        )
    })),
    
    // Panel Toggles
    toggleExplorer: () => set(state => ({ isExplorerOpen: !state.isExplorerOpen, isGitPanelOpen: false, isSearchOpen: false })),
    toggleGitPanel: () => set(state => ({ isGitPanelOpen: !state.isGitPanelOpen, isExplorerOpen: false, isSearchOpen: false })),
    toggleSearch: () => set(state => ({ isSearchOpen: !state.isSearchOpen, isExplorerOpen: false, isGitPanelOpen: false })),
    toggleTerminal: () => set(state => ({ isTerminalOpen: !state.isTerminalOpen })),
    toggleAIPanel: () => set(state => ({ isAIPanelOpen: !state.isAIPanelOpen })),
}));
