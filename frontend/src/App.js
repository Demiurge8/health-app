import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Registration';
import UserDropdown from './components/UserDropdown';
import UserForm from './components/UserForm';
import DataPage from './pages/DataPage';
import './App.css';

const ToggleSwitch = ({ isOn, handleToggle }) => {
  return (
    <button className={`toggle-switch ${isOn ? 'on' : 'off'}`} onClick={handleToggle}>
      <FontAwesomeIcon icon={isOn ? faMoon : faSun} />
    </button>
  );
};

const App = () => {
  const [activePage, setActivePage] = useState('login');
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [isBackgroundBlack, setBackgroundBlack] = useState(false);

  const handleLogin = (user) => {
    setAuthenticatedUser(user);
    setActivePage('home');
  };
  
  const handleLogout = () => {
    setAuthenticatedUser(null);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  const handleBackgroundToggle = () => {
    setBackgroundBlack((prevBackground) => !prevBackground);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home />;
      case 'datapage':
        return <DataPage />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      default:
        return null;
    }
  };

  return (
    <div className={`app ${isBackgroundBlack ? 'dark-bg' : 'light-bg'}`}>
      {authenticatedUser ? (
        <div className='main-page'>
          <div className="app-container">
            <div className="menu-frame">
              <div className='menu-header'>
                <h1>Меню</h1>
              </div>
              <div>
                <nav>
                  <ul>
                    <li className={activePage === 'home' ? 'active' : ''}>
                      <button onClick={() => handlePageChange('home')}>Home</button>
                    </li>
                    <li className={activePage === 'datapage' ? 'active' : ''}>
                      <button onClick={() => handlePageChange('datapage')}>Data</button>
                    </li>
                    <li className={activePage === 'about' ? 'active' : ''}>
                      <button onClick={() => handlePageChange('about')}>About</button>
                    </li>
                    <li className={activePage === 'contact' ? 'active' : ''}>
                      <button onClick={() => handlePageChange('contact')}>Contact</button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
            <div className="content-frame">
              <div className="background-toggle">
                <ToggleSwitch isOn={isBackgroundBlack} handleToggle={handleBackgroundToggle} />
              </div>
              <div className='user-panel'>
                <div>
                  <UserDropdown name={authenticatedUser.name} onLogout={handleLogout} />
                </div>
                <div>
                  <UserForm />
                </div>
              </div>
              {renderPage()}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {activePage === 'login' ? (
            <Login onLogin={handleLogin} onRegistrationPage={() => setActivePage('register')} />
          ) : (
            <Register onRegister={() => setActivePage('login')} />
          )}
        </div>
      )}
    </div>
  );
};

export default App;