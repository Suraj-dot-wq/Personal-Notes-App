import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ noteCount, recentCount, search, setSearch }) => {
    const location = useLocation();

    return (
        <aside className="sidebar">

            <div className="sidebar-section">

                <div className="sidebar-label">
                    WORKSPACE
                </div>

                <Link
                    to="/"
                    className={`sidebar-item ${
                        location.pathname === '/' ? 'active' : ''
                    }`}
                >
                    <span className="sidebar-icon">▣</span>
                    <span>All Notes</span>
                    <span className="sidebar-count">
                        {noteCount}
                    </span>
                </Link>

                <Link
                    to="/"
                    className="sidebar-item"
                    onClick={() => {
                        // Recent filtering will be added here
                    }}
                >
                    <span className="sidebar-icon">◷</span>
                    <span>Recent</span>
                    <span className="sidebar-count">
                        {recentCount}
                    </span>
                </Link>

                <Link
                    to="/"
                    className="sidebar-item"
                >
                    <span className="sidebar-icon">★</span>
                    <span>Favorites</span>
                </Link>

            </div>

            <div className="sidebar-divider"></div>

            <div className="sidebar-section">

                <div className="sidebar-label">
                    SEARCH
                </div>

                <div className="sidebar-search">
                    <span className="sidebar-search-icon">⌕</span>

                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="sidebar-search-clear"
                        >
                            ×
                        </button>
                    )}
                </div>

            </div>

            <div className="sidebar-bottom">

                <div className="sidebar-tip">
                    <span>✦</span>

                    <div>
                        <strong>Your ideas matter</strong>
                        <p>
                            Keep your thoughts organized
                            and accessible.
                        </p>
                    </div>
                </div>

            </div>

        </aside>
    );
};

export default Sidebar;