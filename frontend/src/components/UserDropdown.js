import React, { useState } from 'react';
import CreatorImage from '../pages/images/Green Card.jpg';
import './UserDropdown.css';

const UserDropdown = ({ name, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const displayName = name || 'User';
  
  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="user-dropdown">
      <button className="user-button" onClick={handleToggleDropdown}>
        {displayName}
      </button>
      {isOpen && (
        <div className="user-menu">
          <img src={CreatorImage} alt="Creator" className="creator-image" />
          <h1>{displayName}</h1>
          <button onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
