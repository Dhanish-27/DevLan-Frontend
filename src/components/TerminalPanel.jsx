import React, { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useIDEStore } from '../store/useIDEStore';

const TerminalPanel = () => {
    const { toggleTerminal } = useIDEStore();
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);
    const [isMaximized, setIsMaximized] = React.useState(false);

    useEffect(() => {
        if (!terminalRef.current) return;

        // Initialize xterm
        const term = new Terminal({
            theme: {
                background: '#0a0a0a',
                foreground: '#e5e5e5',
                cursor: '#3b82f6',
                black: '#000000',
                red: '#ef4444',
                green: '#10b981',
                yellow: '#f59e0b',
                blue: '#3b82f6',
                magenta: '#d946ef',
                cyan: '#06b6d4',
                white: '#ffffff',
            },
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            fontSize: 13,
            cursorBlink: true,
            convertEol: true
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        
        term.open(terminalRef.current);
        fitAddon.fit();

        term.writeln('Welcome to DEVLAN Terminal (MVP Dummy Output)');
        term.writeln('Connecting to local environment...');
        term.writeln('$ ');

        // Basic echo for demo purposes
        let currentLine = '';
        term.onData(e => {
            if (e === '\r') {
                term.writeln('');
                if (currentLine.trim() === 'clear') {
                    term.clear();
                } else if (currentLine.trim()) {
                    term.writeln(`Command not found in MVP: ${currentLine}`);
                }
                term.write('$ ');
                currentLine = '';
            } else if (e === '\u007F') { // Backspace
                if (currentLine.length > 0) {
                    currentLine = currentLine.substring(0, currentLine.length - 1);
                    term.write('\b \b');
                }
            } else {
                currentLine += e;
                term.write(e);
            }
        });

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        // Handle resize
        const handleResize = () => fitAddon.fit();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            term.dispose();
        };
    }, []);

    // Re-fit when maximized toggles
    useEffect(() => {
        setTimeout(() => {
            if (fitAddonRef.current) fitAddonRef.current.fit();
        }, 50);
    }, [isMaximized]);

    return (
        <div className={`flex flex-col bg-[var(--bg-secondary)] border-t border-[var(--border-color)] transition-all ${isMaximized ? 'h-[80vh]' : 'h-[250px]'}`}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                    <TerminalIcon size={14} /> Terminal
                </div>
                <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                    <button onClick={() => xtermRef.current?.clear()} title="Clear" className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded text-[var(--text-secondary)]"><Trash2 size={14} /></button>
                    <button onClick={() => setIsMaximized(!isMaximized)} title="Toggle Maximize" className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded text-[var(--text-secondary)]">
                        {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    <button onClick={toggleTerminal} title="Close" className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded text-[var(--text-secondary)]"><X size={14} /></button>
                </div>
            </div>
            
            {/* The terminal container needs flex-1 and min-height 0 to prevent overflow issues */}
            <div className="flex-1 p-2 min-h-0 relative">
                <div ref={terminalRef} className="absolute inset-2" />
            </div>
        </div>
    );
};

export default TerminalPanel;
