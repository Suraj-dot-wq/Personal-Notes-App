import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ReactComponent as ArrowLeft } from '../assets/arrow-left.svg';
import { apiFetch, logout } from '../api';
import { useToast } from '../components/Toast';

const NotePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    const [loading, setLoading] = useState(id !== 'new');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const getNote = async () => {
            if (id === 'new') {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const response = await apiFetch(`/notes/${id}/`);

                if (response.status === 401) {
                    logout();
                    navigate('/login');
                    showToast('Your session has expired. Please log in again.', 'error');
                    return;
                }

                if (!response.ok) {
                    showToast('Unable to load this note.', 'error');
                    navigate('/');
                    return;
                }

                const data = await response.json();

                const lines = (data.body || '').split('\n');

                setTitle(lines[0] || '');
                setBody(lines.slice(1).join('\n'));

            } catch (error) {
                console.error('Failed to load note:', error);
                showToast('Unable to connect to the server.', 'error');
            } finally {
                setLoading(false);
            }
        };

        getNote();
    }, [id, navigate, showToast]);

    const getNoteContent = () => {
        const cleanTitle = title.trim();
        const cleanBody = body.trim();

        if (cleanTitle && cleanBody) {
            return `${cleanTitle}\n${cleanBody}`;
        }

        return cleanTitle || cleanBody;
    };

    const saveNote = async () => {
        const noteContent = getNoteContent();

        if (!noteContent.trim()) {
            showToast('Please enter some content before saving.', 'error');
            return;
        }

        try {
            setSaving(true);
            setSaved(false);

            let response;

            if (id === 'new') {
                response = await apiFetch('/notes/create/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        body: noteContent
                    })
                });
            } else {
                response = await apiFetch(`/notes/${id}/update/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        body: noteContent
                    })
                });
            }

            if (response.status === 401) {
                logout();
                navigate('/login');
                showToast('Your session has expired. Please log in again.', 'error');
                return;
            }

            if (!response.ok) {
                showToast('Failed to save the note.', 'error');
                return;
            }

            setSaved(true);

            if (id === 'new') {
                showToast('Note created successfully.', 'success');
            } else {
                showToast('Note updated successfully.', 'success');
            }

            setTimeout(() => {
                navigate('/');
            }, 700);

        } catch (error) {
            console.error('Failed to save note:', error);
            showToast('Unable to connect to the server.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const deleteNote = async () => {
        if (id === 'new') {
            navigate('/');
            return;
        }

        const confirmed = window.confirm(
            'Are you sure you want to delete this note?'
        );

        if (!confirmed) {
            return;
        }

        try {
            setSaving(true);

            const response = await apiFetch(
                `/notes/${id}/delete/`,
                {
                    method: 'DELETE'
                }
            );

            if (response.status === 401) {
                logout();
                navigate('/login');
                showToast('Your session has expired. Please log in again.', 'error');
                return;
            }

            if (!response.ok) {
                showToast('Failed to delete the note.', 'error');
                return;
            }

            showToast('Note deleted successfully.', 'success');

            setTimeout(() => {
                navigate('/');
            }, 500);

        } catch (error) {
            console.error('Failed to delete note:', error);
            showToast('Unable to connect to the server.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setSaved(false);
    };

    const handleBodyChange = (e) => {
        setBody(e.target.value);
        setSaved(false);
    };

    const fullContent = getNoteContent();

    const wordCount = fullContent.trim()
        ? fullContent.trim().split(/\s+/).length
        : 0;

    const characterCount = fullContent.length;

    if (loading) {
        return (
            <div className="editor-loading">
                <div className="loading-spinner"></div>
                <p>Opening note...</p>
            </div>
        );
    }

    return (
        <main className="editor-page">

            <div className="editor-toolbar">

                <Link to="/" className="back-button">
                    <ArrowLeft />
                    <span>Back</span>
                </Link>

                <div className="editor-actions">

                    {saved && (
                        <span className="saved-status">
                            ✓ Saved
                        </span>
                    )}

                    {!saved && fullContent && !saving && (
                        <span className="unsaved-status">
                            Unsaved changes
                        </span>
                    )}

                    {id !== 'new' && (
                        <button
                            className="delete-button"
                            onClick={deleteNote}
                            disabled={saving}
                        >
                            Delete
                        </button>
                    )}

                    <button
                        className="save-button"
                        onClick={saveNote}
                        disabled={saving || !fullContent.trim()}
                    >
                        {saving ? (
                            <>
                                <span className="button-spinner"></span>
                                Saving...
                            </>
                        ) : (
                            'Save'
                        )}
                    </button>

                </div>

            </div>

            <section className="editor-container">

                <div className="editor-label">
                    {id === 'new'
                        ? 'NEW NOTE'
                        : 'NOTE'}
                </div>

                <input
                    className="note-title-input"
                    placeholder="Untitled note"
                    value={title}
                    onChange={handleTitleChange}
                    autoFocus={id === 'new'}
                />

                <textarea
                    className="modern-note-editor"
                    placeholder="Start writing your thoughts..."
                    value={body}
                    onChange={handleBodyChange}
                />

                <div className="editor-footer">

                    <span>
                        {wordCount} {wordCount === 1 ? 'word' : 'words'}
                    </span>

                    <span>•</span>

                    <span>
                        {characterCount} characters
                    </span>

                </div>

            </section>

        </main>
    );
};

export default NotePage;