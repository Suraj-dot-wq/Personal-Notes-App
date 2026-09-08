import React from 'react';
import { Link } from 'react-router-dom';

const ListItem = ({ note }) => {
    const body = note.body || '';

    const lines = body
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

    const title = lines[0] || 'Untitled Note';

    const preview = lines.slice(1).join(' ') || body;

    const formattedDate = note.updated
        ? new Date(note.updated).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
        : '';

    return (
        <Link to={`/note/${note.id}`} className="note-card-link">
            <article className="modern-note-card">

                <div className="note-card-top">
                    <span className="note-dot"></span>

                    <span className="note-date">
                        {formattedDate}
                    </span>
                </div>

                <h3 className="note-card-title">
                    {title.length > 55
                        ? `${title.substring(0, 55)}...`
                        : title}
                </h3>

                <p className="note-card-preview">
                    {preview.length > 120
                        ? `${preview.substring(0, 120)}...`
                        : preview || 'No content yet.'}
                </p>

                <div className="note-card-footer">
                    <span>Open note</span>
                    <span className="note-arrow">→</span>
                </div>

            </article>
        </Link>
    );
};

export default ListItem;