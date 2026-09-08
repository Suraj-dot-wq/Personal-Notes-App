import React from 'react';
import { Link } from 'react-router-dom';

const AddButton = () => {
    return (
        <Link to="/note/new" className="new-note-button">
            <span className="plus-icon">+</span>
            <span>New Note</span>
        </Link>
    );
};

export default AddButton;