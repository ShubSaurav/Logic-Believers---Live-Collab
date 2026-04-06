import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users, MonitorSpeaker, Clock, Calendar, ArrowRight, Play, Sun, Moon, Inbox } from 'lucide-react';
import { ThemeContext } from '../App';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const [recentRooms, setRecentRooms] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [dashRes, histRes] = await Promise.all([
          fetch('http://localhost:3001/api/dashboard'),
          fetch('http://localhost:3001/api/history')
        ]);
        
        const dashData = await dashRes.json();
        const histData = await histRes.json();
        
        setRecentRooms(dashData.recentRooms || []);
        setHistory(histData.sessions ? histData.sessions.slice(0, 4) : []);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const createRoom = async () => {
    try {
      const response = await fetch('http://localhost:3001/room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: 'New Brainstorm Session' })
      });
      const data = await response.json();
      if (data.success) {
        navigate(`/room/${data.roomId}`);
      }
    } catch (err) {
      console.error("Failed to create room", err);
      navigate(`/room/HACK24`);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <nav className="glass navbar">
        <div className="navbar-left">
          <h2 className="logo" onClick={() => navigate('/dashboard')}>
            <img src="/logo.png" alt="LiveCollab" style={{ height: '32px' }} />
          </h2>
        </div>
        
        <div className="navbar-center">
          <div className="search-bar glass-panel">
            <Search size={18} className="text-secondary" />
            <input type="text" placeholder="Search rooms, files, or people..." />
          </div>
        </div>

        <div className="navbar-right">
          <button className="icon-btn glass-panel" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="btn-secondary" onClick={() => navigate('/room')}>Join Room</button>
          <button className="btn-primary flex-center" onClick={createRoom}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> New Room
          </button>
          <div className="avatar-dropdown" style={{position: 'relative'}}>
            <div className="avatar glass-panel" onClick={() => setShowDropdown(!showDropdown)}>
              <img src="https://i.pravatar.cc/150?img=11" alt="User Avatar" />
            </div>
            {showDropdown && (
              <div className="glass-card" style={{position: 'absolute', right: 0, top: '50px', width: '150px', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem', zIndex: 100}}>
                <button className="btn-secondary btn-sm" style={{width: '100%', justifyContent: 'flex-start', border: 'none'}} onClick={() => navigate('/settings')}>Settings</button>
                <div style={{height: '1px', background: 'var(--border-color)', margin: '0 0.25rem'}}></div>
                <button className="btn-secondary btn-sm" style={{width: '100%', justifyContent: 'flex-start', border: 'none', color: '#ef4444'}} onClick={() => navigate('/login')}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Section */}
        <header className="page-header">
          <div>
            <h1>Welcome back, Alex</h1>
            <p className="text-secondary">Ready to collaborate and build something great today?</p>
          </div>
        </header>

        {/* Quick Actions */}
        <section className="section quick-actions">
          <div className="glass-card action-card bounce-hover" onClick={createRoom}>
            <div className="icon-wrapper bg-gradient">
              <Plus size={24} color="#fff" />
            </div>
            <h3>Create Room</h3>
            <p className="text-secondary">Start a new blank workspace</p>
          </div>
          
          <div className="glass-card action-card bounce-hover" onClick={() => navigate('/room')}>
            <div className="icon-wrapper">
              <Users size={24} className="text-gradient" />
            </div>
            <h3>Join Room</h3>
            <p className="text-secondary">Enter a code to join team</p>
          </div>

          <div className="glass-card action-card bounce-hover">
            <div className="icon-wrapper">
              <Calendar size={24} className="text-gradient" />
            </div>
            <h3>Schedule</h3>
            <p className="text-secondary">Plan a future collaboration</p>
          </div>
        </section>

        {/* Recent Collaborations */}
        <section className="section">
          <div className="section-header">
            <h2>Recent Rooms</h2>
            <button className="btn-text" onClick={() => navigate('/history')}>View All <ArrowRight size={16} /></button>
          </div>
          
          {isLoading ? (
            <div className="recent-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card room-card skeleton-card">
                  <div className="skeleton-box" style={{width: '40px', height: '40px', borderRadius: '10px'}} />
                  <div className="skeleton-text" style={{width: '70%', marginTop: '1rem'}} />
                  <div className="skeleton-text" style={{width: '40%'}} />
                </div>
              ))}
            </div>
          ) : recentRooms.length > 0 ? (
            <div className="recent-grid">
              {recentRooms.map((room) => (
                <div key={room.id} className="glass-card room-card bounce-hover">
                  <div className="room-card-header">
                    <div className="room-icon">
                      <MonitorSpeaker size={20} className="text-gradient" />
                    </div>
                    <span className="room-status active">{room.status}</span>
                  </div>
                  <h3>{room.title}</h3>
                  <p className="text-secondary text-sm">Active {room.participantCount} users</p>
                  <p className="text-secondary text-xs">Code: {room.id}</p>
                  <div className="room-card-footer">
                    <div className="participants-stack">
                      <img src="https://i.pravatar.cc/150?img=1" alt="p1" />
                      {room.participantCount > 1 && <img src="https://i.pravatar.cc/150?img=2" alt="p2" />}
                    </div>
                    <button className="btn-primary btn-sm" onClick={() => navigate(`/room/${room.id}`)}>
                      <Play size={14} /> Resume
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state glass-panel">
              <div className="empty-icon-wrap">
                <Inbox size={32} className="text-secondary" />
              </div>
              <h3>No Active Rooms</h3>
              <p className="text-secondary">You don't have any active rooms right now. Create one to get started.</p>
              <button className="btn-secondary" onClick={createRoom} style={{marginTop: '1rem'}}>
                <Plus size={16} style={{marginRight:'0.4rem'}}/> Create Room
              </button>
            </div>
          )}
        </section>

        {/* History List */}
        <section className="section" style={{marginBottom: '3rem'}}>
          <div className="section-header">
            <h2>Recent History</h2>
          </div>
          
          {isLoading ? (
            <div className="glass-panel history-list">
              {[1, 2, 3].map(i => (
                <div key={i} className="history-item">
                  <div className="skeleton-box" style={{width: '40px', height: '40px', borderRadius: '10px'}} />
                  <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap:'0.5rem'}}>
                    <div className="skeleton-text" style={{width: '40%'}} />
                    <div className="skeleton-text" style={{width: '20%'}} />
                  </div>
                  <div className="skeleton-box" style={{flex: 2, height: '60px', borderRadius:'8px'}} />
                </div>
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="glass-panel history-list">
              {history.map(item => (
                <div key={item.id} className="history-item">
                  <div className="history-icon">
                    <Clock size={20} className="text-secondary" />
                  </div>
                  <div className="history-info">
                    <h4>{item.title}</h4>
                    <p className="text-secondary text-sm">
                      {new Date(item.date).toLocaleDateString()} • {item.duration}
                    </p>
                  </div>
                  <div className="history-summary">
                    <p className="text-sm">{item.aiSummary}</p>
                  </div>
                  <div className="history-actions">
                    <button className="btn-secondary btn-sm" onClick={() => navigate('/history')}>Details</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-secondary">No collaboration history found.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
