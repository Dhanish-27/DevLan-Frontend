import { useEffect } from 'react';
import { useIDEStore } from '../store/useIDEStore';

export const useShortcuts = () => {
    const { toggleExplorer, toggleTerminal, toggleSearch, toggleGitPanel, closeAllFiles } = useIDEStore();

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Command Palette (Ctrl+Shift+P) handled in CommandPalette.jsx so we don't duplicate it.
            
            // Toggle Terminal (Ctrl+`)
            if ((e.ctrlKey || e.metaKey) && e.key === '`') {
                e.preventDefault();
                toggleTerminal();
            }

            // Close all tabs (Ctrl+K, W) - simple approximation
            if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'w') {
                e.preventDefault();
                closeAllFiles();
            }

            // Global search (Ctrl+Shift+F)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                toggleSearch();
            }

            // Toggle Sidebar (Ctrl+B)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                toggleExplorer(); // Simplification: just toggles explorer
            }

            // Source Control (Ctrl+Shift+G)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
                e.preventDefault();
                toggleGitPanel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleExplorer, toggleTerminal, toggleSearch, toggleGitPanel, closeAllFiles]);
};
