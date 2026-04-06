import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Video, Mic, Bell, Sparkles, MonitorSpeaker } from 'lucide-react';
import { ThemeContext } from '../App';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'audio-video', icon: Video, label: 'Audio & Video' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'ai', icon: Sparkles, label: 'AI Preferences' }
  ];

  return (
    <div className="settings-container">
      {/* Header */}
      <nav className="glass history-navbar">
        <div className="navbar-left">
          <button className="icon-btn glass-panel" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="logo" style={{ marginLeft: '1rem' }} onClick={() => navigate('/dashboard')}>
            <img src="/logo.png" alt="LiveCollab" style={{ height: '32px' }} />
          </h2>
        </div>
      </nav>

      <main className="settings-main">
        <header className="page-header">
          <h1>Settings</h1>
          <p className="text-secondary">Manage your preferences and workspace configuration.</p>
        </header>

        <div className="settings-layout">
          {/* Settings Sidebar */}
          <aside className="settings-sidebar">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </aside>

          {/* Settings Content */}
          <section className="settings-content glass-panel">
            {activeTab === 'profile' && (
              <div className="settings-section">
                <h3>Profile Information</h3>
                <div className="profile-edit">
                  <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="profile-avatar" />
                  <button className="btn-secondary btn-sm">Change Avatar</button>
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Display Name</label>
                    <input type="text" className="input-glass" defaultValue="Alex Developer" />
                  </div>
                  <div className="form-group">
                    <label>Email Space</label>
                    <input type="email" className="input-glass" defaultValue="alex@company.com" disabled />
                  </div>
                </div>
                
                <h3 style={{marginTop: '2rem'}}>Appearance</h3>
                <div className="setting-row">
                  <div>
                    <h4>Dark Theme</h4>
                    <p className="text-secondary text-sm">Toggle the app aesthetic</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                    <span className="slider"></span>
                  </label>
                </div>
                
                <div className="settings-actions">
                  <button className="btn-primary">Save Changes</button>
                </div>
              </div>
            )}

            {activeTab === 'audio-video' && (
              <div className="settings-section">
                <h3>Devices</h3>
                <div className="form-group">
                  <label>Camera Selection</label>
                  <select className="input-glass">
                    <option>FaceTime HD Camera</option>
                    <option>OBS Virtual Camera</option>
                  </select>
                </div>
                
                <div className="form-group" style={{marginTop: '1.5rem'}}>
                  <label>Microphone Selection</label>
                  <select className="input-glass">
                    <option>MacBook Pro Microphone</option>
                    <option>External USB Mic</option>
                  </select>
                </div>

                <h3 style={{marginTop: '2rem'}}>Preview</h3>
                <div className="camera-preview">
                  <div className="preview-placeholder">
                    <Video size={32} className="text-secondary" />
                    <p className="text-secondary">Camera Feed Preview</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h3>Email & Notifications</h3>
                <div className="setting-row">
                  <div>
                    <h4>Room Invites</h4>
                    <p className="text-secondary text-sm">Get notified when someone invites you</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-row">
                  <div>
                    <h4>AI Summary Ready</h4>
                    <p className="text-secondary text-sm">Receive email when meeting notes are parsed</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="settings-section">
                <h3 className="flex-center" style={{justifyContent: 'flex-start', gap: '0.5rem'}}>
                  <Sparkles size={20} className="text-gradient" /> AI Preferences
                </h3>
                <div className="setting-row">
                  <div>
                    <h4>Auto-Summarize Meetings</h4>
                    <p className="text-secondary text-sm">AI will automatically generate notes at the end of a session</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                
                <div className="setting-row">
                  <div>
                    <h4>Action Items Extraction</h4>
                    <p className="text-secondary text-sm">Identify tasks and assignments from spoken words</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings;
