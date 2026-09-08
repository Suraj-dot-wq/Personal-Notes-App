import React from 'react';

const NoteSkeleton = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-line skeleton-small"></div>

            <div className="skeleton-line skeleton-large"></div>

            <div className="skeleton-line skeleton-medium"></div>
            <div className="skeleton-line skeleton-medium"></div>

            <div className="skeleton-line skeleton-small"></div>
        </div>
    );
};

export default NoteSkeleton;