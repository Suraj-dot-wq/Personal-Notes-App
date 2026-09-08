import React, { useState, useEffect } from 'react';
import ListItem from '../components/ListItem.js';
import AddButton from '../components/AddButton.js';
import Sidebar from '../components/sidebar.js';
import NoteSkeleton from '../components/NoteSkeleton';
import { useToast } from '../components/Toast';
import { apiFetch, logout } from '../api';
import { useNavigate } from 'react-router-dom';

const NotesListPage = () => {
    const [notes, setNotes] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const { showToast } = useToast();

    useEffect(() => {
        getNotes();
    }, []);

    const getNotes = async () => {
        try {
            setLoading(true);

            const response = await apiFetch('/notes/');

            if (response.status === 401) {
                logout();
                navigate('/login');

                showToast(
                    'Your session has expired. Please log in again.',
                    'error'
                );

                return;
            }

            if (!response.ok) {
                throw new Error('Failed to load notes');
            }

            const data = await response.json();

            setNotes(data);

        } catch (error) {
            console.error(error);

            showToast(
                'Unable to load your notes.',
                'error'
            );

        } finally {
            setLoading(false);
        }
    };

    const filteredNotes = notes.filter((note) =>
        (note.body || '')
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const recentNotes = notes.filter((note) => {
        const noteDate = new Date(note.updated);
        const now = new Date();

        const difference =
            now.getTime() - noteDate.getTime();

        return difference <
            7 * 24 * 60 * 60 * 1000;
    });

    return (
        <main className="dashboard-layout">

            <Sidebar
                noteCount={notes.length}
                recentCount={recentNotes.length}
                search={search}
                setSearch={setSearch}
            />

            <section className="dashboard">

                <section className="dashboard-hero">

                    <div>

                        <span className="eyebrow">
                            YOUR WORKSPACE
                        </span>

                        <h2>
                            Your thoughts,
                            <br />
                            <span>organized.</span>
                        </h2>

                        <p>
                            Capture ideas, organize your thoughts,
                            and keep everything in one secure place.
                        </p>

                    </div>

                </section>

                <section className="stats-grid">

                    <div className="stat-card">

                        <div className="stat-icon">
                            📝
                        </div>

                        <div>
                            <span>Total notes</span>
                            <strong>{notes.length}</strong>
                        </div>

                    </div>

                    <div className="stat-card">

                        <div className="stat-icon">
                            ✨
                        </div>

                        <div>
                            <span>Last 7 days</span>

                            <strong>
                                {recentNotes.length}
                            </strong>
                        </div>

                    </div>

                    <div className="stat-card">

                        <div className="stat-icon">
                            🔐
                        </div>

                        <div>
                            <span>Privacy</span>
                            <strong>Protected</strong>
                        </div>

                    </div>

                </section>

                <section className="notes-section">

                    <div className="notes-toolbar">

                        <div>

                            <h2>Your notes</h2>

                            <p>
                                {search
                                    ? `${filteredNotes.length} result${
                                        filteredNotes.length !== 1
                                            ? 's'
                                            : ''
                                    }`
                                    : `${notes.length} note${
                                        notes.length !== 1
                                            ? 's'
                                            : ''
                                    }`
                                }
                            </p>

                        </div>

                        <div className="desktop-search">

                            <span>⌕</span>

                            <input
                                type="text"
                                placeholder="Search your notes..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                >
                                    ×
                                </button>
                            )}

                        </div>

                    </div>


                    {/* =========================================
                        LOADING SKELETON
                    ========================================= */}

                    {loading && (
                        <div className="skeleton-grid">

                            <NoteSkeleton />
                            <NoteSkeleton />
                            <NoteSkeleton />
                            <NoteSkeleton />
                            <NoteSkeleton />
                            <NoteSkeleton />

                        </div>
                    )}


                    {/* =========================================
                        EMPTY STATE
                    ========================================= */}

                    {!loading &&
                        filteredNotes.length === 0 && (

                            <div className="empty-state">

                                <div className="empty-icon">
                                    {search ? '🔎' : '✍️'}
                                </div>

                                <h3>
                                    {search
                                        ? 'No notes found'
                                        : 'Your notebook is empty'}
                                </h3>

                                <p>
                                    {search
                                        ? 'Try searching with a different keyword.'
                                        : 'Start capturing your first idea.'}
                                </p>

                            </div>

                        )
                    }


                    {/* =========================================
                        NOTES LIST
                    ========================================= */}

                    {!loading &&
                        filteredNotes.length > 0 && (

                            <div className="notes-list">

                                {filteredNotes.map((note) => (

                                    <div
                                        className="note-preview"
                                        key={note.id}
                                    >

                                        <ListItem note={note} />

                                    </div>

                                ))}

                            </div>

                        )
                    }

                </section>

                <AddButton />

            </section>

        </main>
    );
};

export default NotesListPage;