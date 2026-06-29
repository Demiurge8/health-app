import React, { useState } from 'react';
import './UserForm.css';

const UserForm = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="us-dropdown">
      <button className="us-button" onClick={handleToggleDropdown}>
        <i className="fa-regular fa-bell fa-2xl"></i>
      </button>
      {isOpen && (
        <div className="us-menu">
          <div className='us-menu-head'>
            <h1>Notification</h1>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserForm;