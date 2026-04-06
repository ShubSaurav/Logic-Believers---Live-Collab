import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonitorSpeaker, ArrowLeft, Download, PlayCircle, Clock, Calendar as CalendarIcon, Filter, Search, Sparkles, Inbox } from 'lucide-react';
import { apiBaseUrl } from '../config';
import './History.css';
import './Dashboard.css'; // Leverage skeleton classes

const History = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
          const response = await fetch(`${apiBaseUrl}/api/history`);
        const data = await response.json();
        setSessions(data.sessions || []);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="history-container">
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

      <main className="history-main">
        <header className="page-header flex-center-between">
          <div>
            <h1>Collaboration History</h1>
            <p className="text-secondary">Review your past meetings, AI summaries, and recordings.</p>
          </div>
          <div className="filters glass-panel">
            <div className="search-box">
              <Search size={16} className="text-secondary"/>
              <input type="text" placeholder="Search sessions..." />
            </div>
            <div className="vertical-divider"></div>
            <button className="btn-text text-secondary"><Filter size={16}/> Filter</button>
          </div>
        </header>

        <div className="timeline-container">
          {isLoading ? (
            // Skeleton State
            [1, 2, 3].map((_, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker">
                  <div className="marker-dot" style={{background: 'var(--border-color)', boxShadow: 'none'}}></div>
                  {index !== 2 && <div className="marker-line"></div>}
                </div>
                
                <div className="timeline-content glass-card skeleton-card">
                  <div className="skeleton-text" style={{width: '40%', height: '20px'}}></div>
                  <div className="skeleton-text" style={{width: '60%'}}></div>
                  <div className="skeleton-box" style={{height: '80px', borderRadius: '8px', marginTop: '1rem'}}></div>
                </div>
              </div>
            ))
          ) : sessions.length > 0 ? (
            // Loaded State
            sessions.map((session, index) => (
              <div key={session.id} className="timeline-item">
                <div className="timeline-marker">
                  <div className="marker-dot"></div>
                  {index !== sessions.length - 1 && <div className="marker-line"></div>}
                </div>
                
                <div className="timeline-content glass-card bounce-hover">
                  <div className="content-header">
                    <h3>{session.title}</h3>
                    <div className="session-meta">
                      <span className="meta-item"><CalendarIcon size={14}/> {new Date(session.date).toLocaleString()}</span>
                      <span className="meta-item"><Clock size={14}/> {session.duration}</span>
                      <span className="meta-item"><UsersIcon count={session.participants}/></span>
                    </div>
                  </div>

                  <div className="content-body">
                    <div className="ai-summary-box">
                      <h4 className="flex-align"><Sparkles size={16} className="text-gradient" style={{marginRight:'0.4rem'}}/> AI Summary</h4>
                      <p>{session.aiSummary}</p>
                    </div>
                  </div>

                  <div className="content-actions">
                    <button className="btn-secondary btn-sm" onClick={() => navigate('/room')}>
                      Reopen Space
                    </button>
                    <button className="btn-secondary btn-sm">
                      <Download size={16} style={{marginRight:'0.4rem'}}/> Notes
                    </button>
                    {session.recordingAvailable && (
                      <button className="btn-primary btn-sm" style={{marginLeft: 'auto'}}>
                        <PlayCircle size={16} style={{marginRight:'0.4rem'}}/> Playback
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Empty State
            <div className="empty-state glass-panel">
              <div className="empty-icon-wrap">
                <Inbox size={32} className="text-secondary" />
              </div>
              <h3>No Past Collaborations</h3>
              <p className="text-secondary">It looks like you haven't had any sessions yet. Once you complete a room, your AI-generated summaries will appear here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const UsersIcon = ({count}) => (
  <span style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    {count}
  </span>
);

export default History;
