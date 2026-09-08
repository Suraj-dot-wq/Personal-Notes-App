import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ListItem from '../components/ListItem.js';
import Sidebar from '../components/Sidebar.js';
import AddButton from '../components/AddButton.js';
import { apiFetch, logout } from '../api.js';
import { useToast } from '../components/Toast.js';

const NotesListPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [notes, setNotes] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await apiFetch('/notes/');

                // Access token is invalid/expired
                if (response.status === 401) {
                    logout();
                    setNotes([]);
                    navigate('/login', { replace: true });
                    showToast('Session expired. Please login again.', 'error');
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Failed to load notes: ${response.status}`);
                }

                const data = await response.json();

                console.log('Notes API response:', data);

                // Make sure we only store an array
                if (Array.isArray(data)) {
                    setNotes(data);
                } else {
                    console.error('Expected notes array but received:', data);
                    setNotes([]);
                    showToast('Unable to load notes.', 'error');
                }

            } catch (error) {
                console.error('Unable to load notes:', error);
                setNotes([]);
                showToast('Unable to load notes.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, [navigate, showToast]);

    const filteredNotes = useMemo(() => {
        if (!Array.isArray(notes)) {
            return [];
        }

        const query = search.trim().toLowerCase();

        if (!query) {
            return notes;
        }

        return notes.filter((note) =>
            (note.body || '').toLowerCase().includes(query)
        );
    }, [notes, search]);

    const recentNotes = useMemo(() => {
        if (!Array.isArray(notes)) {
            return [];
        }

        return notes.filter((note) => {
            if (!note.updated) {
                return false;
            }

            const updatedDate = new Date(note.updated);
            const now = new Date();

            const difference =
                (now.getTime() - updatedDate.getTime()) /
                (1000 * 60 * 60 * 24);

            return difference <= 7;
        });
    }, [notes]);

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar
                    noteCount={0}
                    recentCount={0}
                    search={search}
                    setSearch={setSearch}
                />

                <main className="dashboard">
                    <div className="empty-state">
                        <h3>Loading notes...</h3>
                        <p>Please wait while your notes are loaded.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">

            <Sidebar
                noteCount={notes.length}
                recentCount={recentNotes.length}
                search={search}
                setSearch={setSearch}
            />

            <main className="dashboard">

                <section className="dashboard-hero">
                    <h2>Your ideas, organized.</h2>
                    <p>
                        Capture your thoughts, manage your notes,
                        and keep everything accessible in one place.
                    </p>
                </section>

                <section className="stats-grid">

                    <div className="stat-card">
                        <h3>{notes.length}</h3>
                        <p>Total Notes</p>
                    </div>

                    <div className="stat-card">
                        <h3>{recentNotes.length}</h3>
                        <p>Recent Notes</p>
                    </div>

                </section>

                <section className="notes-section">

                    <div className="notes-toolbar">
                        <div>
                            <h2>All Notes</h2>
                            <p>
                                {filteredNotes.length} note
                                {filteredNotes.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        <input
                            className="desktop-search"
                            type="text"
                            placeholder="Search notes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {filteredNotes.length === 0 ? (
                        <div className="empty-state">

                            <h3>
                                {search
                                    ? 'No notes found'
                                    : 'No notes yet'}
                            </h3>

                            <p>
                                {search
                                    ? 'Try searching for something else.'
                                    : 'Create your first note to get started.'}
                            </p>

                        </div>
                    ) : (
                        <div className="notes-list">
                            {filteredNotes.map((note) => (
                                <ListItem
                                    key={note.id}
                                    note={note}
                                />
                            ))}
                        </div>
                    )}

                </section>

                <AddButton />

            </main>
        </div>
    );
};

export default NotesListPage;
