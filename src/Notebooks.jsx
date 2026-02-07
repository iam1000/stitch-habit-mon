import React, { useState, useEffect } from 'react';
import {
    Book,
    ExternalLink,
    FileText,
    Clock,
    Share2,
    Users
} from 'lucide-react';
import notebooksData from './notebooks_data.json';

const Notebooks = () => {
    const [notebooks, setNotebooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate "MCP Connection" delay
        const fetchNotebooks = async () => {
            await new Promise(resolve => setTimeout(resolve, 800)); // 0.8s mock delay
            setNotebooks(notebooksData);
            setLoading(false);
        };

        fetchNotebooks();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
                <div className="animate-spin mb-4">
                    <Book size={32} />
                </div>
                <p>Connecting to NotebookLM MCP...</p>
            </div>
        );
    }

    return (
        <div className="font-body pb-12 transition-colors duration-200">
            {/* Header */}
            <header className="bg-[var(--bg-card)] border-b border-[var(--border-color)] sticky top-0 z-20 px-6 py-4 flex justify-between items-center transition-colors duration-200">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-[800] text-[var(--text-main)] flex items-center gap-2 font-heading">
                        <Book className="text-[#8c36e2]" />
                        NotebookLM
                    </h1>
                </div>
                <div className="text-sm text-[var(--text-muted)] font-bold">
                    {notebooks.length} Notebooks (MCP Linked)
                </div>
            </header>

            {/* List */}
            <main className="container mx-auto px-6 py-8">
                <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--bg-main)] text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider border-b border-[var(--border-color)]">
                                    <th className="px-6 py-4">Notebook Title</th>
                                    <th className="px-6 py-4">Ownership</th>
                                    <th className="px-6 py-4 text-center">Sources</th>
                                    <th className="px-6 py-4">Last Modified</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {notebooks.map((nb) => (
                                    <tr
                                        key={nb.id}
                                        className="hover:bg-[var(--bg-main)] transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${nb.ownership === 'owned' ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/20' : 'bg-purple-50 text-purple-500 dark:bg-purple-900/20'}`}>
                                                    <Book size={18} />
                                                </div>
                                                <span className="font-bold text-[var(--text-main)] line-clamp-1 max-w-xs sm:max-w-md">
                                                    {nb.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {nb.ownership === 'shared_with_me' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                                                    <Users size={12} /> Shared
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                                                    <Users size={12} /> Owned
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] bg-[var(--bg-main)] px-2.5 py-0.5 rounded-md">
                                                <FileText size={14} /> {nb.source_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                                <Clock size={14} />
                                                {new Date(nb.modified_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a
                                                href={nb.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[#8c36e2] hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                                                title="Open Notebook"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Notebooks;
