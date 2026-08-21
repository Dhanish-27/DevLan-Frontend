import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Loader2 } from 'lucide-react';
import { useIDEStore } from '../store/useIDEStore';

const AIPanel = () => {
    const { activeFile, openFiles } = useIDEStore();
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I'm your DEVLAN AI Assistant. How can I help you with your code today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        
        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        // MVP Dummy Response
        setTimeout(() => {
            let reply = "I'm a dummy MVP AI. ";
            if (activeFile) {
                const activeContent = openFiles.find(f => f.path === activeFile)?.content;
                reply += `I see you are working on \`${activeFile}\`. `;
                if (userMsg.toLowerCase().includes('explain')) {
                    reply += `It looks like code. I would explain it here using Markdown.`;
                }
            } else {
                reply += "Open a file and ask me to explain it or generate code!";
            }

            setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)]">
            <div className="flex items-center justify-between p-3 border-b border-[var(--border-color)]">
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare size={14} /> AI Assistant
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--border-color)] text-[var(--text-primary)]'}`}>
                            {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                        </div>
                        <div className={`text-sm p-3 rounded-lg max-w-[85%] ${
                            msg.role === 'user' 
                                ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] rounded-tr-none' 
                                : 'bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center flex-shrink-0">
                            <Bot size={16} />
                        </div>
                        <div className="text-sm p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-tl-none flex items-center gap-2 text-[var(--text-secondary)]">
                            <Loader2 size={14} className="animate-spin" /> Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-[var(--border-color)]">
                <div className="relative">
                    <textarea 
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg py-2 pl-3 pr-10 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none"
                        placeholder="Ask me anything..."
                        rows={1}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <button 
                        className="absolute right-2 bottom-2 p-1 text-[var(--accent)] hover:bg-[var(--accent-glow)] rounded transition-colors disabled:opacity-50"
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="text-center mt-2 text-[10px] text-[var(--text-secondary)] opacity-50">
                    MVP version. AI is simulated.
                </div>
            </div>
        </div>
    );
};

export default AIPanel;
