import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Users, FolderOpen, History as HistoryIcon, 
  Pen, Type, StickyNote, Image as ImageIcon, Square, Circle, Eraser, Undo, Redo, MousePointer2,
  Sparkles, ListTodo, FileText, CheckSquare, MessageCircle,
  Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Hand, Settings,
  Link, UserPlus, MoreHorizontal, Maximize2
} from 'lucide-react';
import { wsBaseUrl } from '../config';
import './Room.css';

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [activeLeftTab, setActiveLeftTab] = useState('chat');
  const [activeTool, setActiveTool] = useState('cursor');
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
  
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [cursors, setCursors] = useState({});
  const [clientId, setClientId] = useState('');
  const [roomUsers, setRoomUsers] = useState(1);
  const [joinError, setJoinError] = useState('');
  
  const [mediaState, setMediaState] = useState({
    mic: true,
    camera: true,
    screen: false
  });

  const boardRef = useRef(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (!roomId) {
      alert('Please enter a room code to join.');
      navigate('/dashboard');
      return;
    }

    // Establish WebSocket using room ID
    const socket = new WebSocket(`${wsBaseUrl}/connect`);
    
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join', roomId }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'joined') {
        setJoinError('');
        setClientId(data.clientId);
        // Load initial chat history from the backend
        if (data.history && data.history.length > 0) {
          setMessages(data.history);
        }
      } else if (data.type === 'error') {
        setJoinError(data.message || 'Unable to join room');
        alert(data.message || 'Unable to join room');
        navigate('/dashboard');
      } else if (data.type === 'chat') {
        setMessages(prev => [...prev, data]);
      } else if (data.type === 'cursor') {
        setCursors(prev => ({
          ...prev,
          [data.senderId]: { x: data.x, y: data.y }
        }));
      } else if (data.type === 'user_joined') {
        setRoomUsers(prev => prev + 1);
        setMessages(prev => [...prev, { type: 'system', text: data.message }]);
      } else if (data.type === 'user_left') {
        setRoomUsers(prev => Math.max(1, prev - 1));
        setMessages(prev => [...prev, { type: 'system', text: `User ${data.clientId.slice(0,4)} left the room` }]);
      }
    };

    socket.onerror = () => {
      setJoinError('Connection error. Please try again.');
    };

    setWs(socket);

    return () => socket.close();
  }, [roomId, navigate]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleMouseMove = (e) => {
    if (ws && ws.readyState === WebSocket.OPEN && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // emit to other clients
      ws.send(JSON.stringify({ type: 'cursor', x, y, roomId }));
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMsg.trim() && ws) {
      const msg = { type: 'chat', text: inputMsg, roomId };
      ws.send(JSON.stringify(msg));
      setMessages(prev => [...prev, { ...msg, senderId: clientId }]);
      setInputMsg('');
    }
  };

  const toggleMedia = (type) => {
    setMediaState(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="room-layout">
      {/* Top Bar */}
      <header className="glass room-top-bar">
        <div className="room-info">
          <div className="room-title">
            <h2 className="text-gradient">Board: {roomId}</h2>
            <span className="live-badge">LIVE</span>
          </div>
          {joinError && <p className="text-secondary text-sm">{joinError}</p>}
        </div>
        
        <div className="room-actions">
          <div className="facepile">
            <div className="avatar extra-count active-speaker">ME</div>
            {roomUsers > 1 && <div className="avatar extra-count">U1</div>}
            {roomUsers > 2 && <div className="avatar extra-count">U2</div>}
            {roomUsers > 3 && <div className="avatar extra-count">+{roomUsers - 3}</div>}
          </div>
          
          <button className="btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem' }}>
            <Link size={16} /> Link
          </button>
          <button className="btn-primary btn-sm flex-center">
            <UserPlus size={16} style={{ marginRight: '0.4rem' }} /> Invite
          </button>
          <button className="btn-danger btn-sm" onClick={() => navigate('/dashboard')}>End Session</button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="room-body">
        
        {/* Left Sidebar */}
        <aside className="glass-panel left-sidebar">
          <div className="sidebar-tabs">
            <button className={`tab-btn ${activeLeftTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveLeftTab('chat')}>
              <MessageSquare size={20} />
            </button>
            <button className={`tab-btn ${activeLeftTab === 'users' ? 'active' : ''}`} onClick={() => setActiveLeftTab('users')}>
              <Users size={20} />
            </button>
            <button className={`tab-btn ${activeLeftTab === 'files' ? 'active' : ''}`} onClick={() => setActiveLeftTab('files')}>
              <FolderOpen size={20} />
            </button>
            <button className={`tab-btn ${activeLeftTab === 'history' ? 'active' : ''}`} onClick={() => setActiveLeftTab('history')}>
              <HistoryIcon size={20} />
            </button>
          </div>
          
          <div className="sidebar-content">
            {activeLeftTab === 'chat' && (
              <div className="chat-container">
                <div className="chat-messages">
                  <div className="message system">Welcome to {roomId}</div>
                  {messages.map((m, i) => (
                    <div key={i} className={`message ${m.type === 'system' ? 'system' : (m.senderId === clientId ? 'me' : 'other')}`}>
                      {m.type !== 'system' && m.senderId !== clientId && <span className="sender-name">User {m.senderId.slice(0, 4)}</span>}
                      {m.type === 'system' ? m.text : <div className="bubble">{m.text}</div>}
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>
                <form onSubmit={handleSendMessage} className="chat-input-area">
                  <input 
                    type="text" 
                    value={inputMsg} 
                    onChange={e => setInputMsg(e.target.value)} 
                    placeholder="Type a message..." 
                    className="input-glass"
                  />
                </form>
              </div>
            )}
            {/* Mock other tabs */}
            {activeLeftTab !== 'chat' && (
              <div className="empty-state" style={{flex: 1, padding: '2rem'}}>
                <div className="empty-icon-wrap" style={{width: '48px', height: '48px', marginBottom: '1rem'}}>
                  {activeLeftTab === 'users' && <Users size={24} className="text-secondary" />}
                  {activeLeftTab === 'files' && <FolderOpen size={24} className="text-secondary" />}
                  {activeLeftTab === 'history' && <HistoryIcon size={24} className="text-secondary" />}
                </div>
                <p className="text-secondary text-center text-sm">No {activeLeftTab} found in this room yet.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Center Canvas */}
        <main className="canvas-area">
          {/* Top Floating Video Strip */}
          <div className="video-strip">
            <div className="video-tile active">
              <div className="video-placeholder">ME</div>
              <div className="tile-name">You {!mediaState.mic && <MicOff size={12} style={{marginLeft:'4px'}} color="#ef4444"/>}</div>
            </div>
            {roomUsers > 1 && (
              <div className="video-tile">
                <div className="video-placeholder">U1</div>
                <div className="tile-name">Remote <MicOff size={12} className="text-secondary" style={{marginLeft: '4px'}}/></div>
              </div>
            )}
          </div>

          <div className="whiteboard-wrapper" ref={boardRef} onMouseMove={handleMouseMove}>
            {/* Whiteboard Toolbar */}
            <div className="glass-card whiteboard-toolbar">
              <button title="Select" onClick={()=>setActiveTool('cursor')} className={`tool-btn bounce-hover ${activeTool==='cursor'?'active':''}`}><MousePointer2 size={18} /></button>
              <div className="tool-divider"></div>
              <button title="Pen" onClick={()=>setActiveTool('pen')} className={`tool-btn bounce-hover ${activeTool==='pen'?'active':''}`}><Pen size={18} /></button>
              <button title="Text" onClick={()=>setActiveTool('text')} className={`tool-btn bounce-hover ${activeTool==='text'?'active':''}`}><Type size={18} /></button>
              <button title="Sticky" onClick={()=>setActiveTool('sticky')} className={`tool-btn bounce-hover ${activeTool==='sticky'?'active':''}`}><StickyNote size={18} /></button>
              <button title="Shape" onClick={()=>setActiveTool('shape')} className={`tool-btn bounce-hover ${activeTool==='shape'?'active':''}`}><Square size={18} /></button>
              <button title="Image" onClick={()=>setActiveTool('image')} className={`tool-btn bounce-hover ${activeTool==='image'?'active':''}`}><ImageIcon size={18} /></button>
              <div className="tool-divider"></div>
              <button title="Eraser" onClick={()=>setActiveTool('eraser')} className={`tool-btn bounce-hover ${activeTool==='eraser'?'active':''}`}><Eraser size={18} /></button>
            </div>

            <div className="static-board-content">
              {/* Remote Cursors */}
              {Object.keys(cursors).map(id => {
                if (id !== clientId) {
                  return (
                    <div key={id} className="remote-cursor" style={{ transform: `translate(${cursors[id].x}px, ${cursors[id].y}px)` }}>
                      <MousePointer2 size={18} fill="var(--accent-secondary)" color="var(--accent-secondary)" />
                      <span className="cursor-label">{id.slice(0,4)}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </main>

        {/* Right Sidebar - AI Assistant */}
        {isAiPanelOpen && (
          <aside className="glass-panel right-sidebar">
            <div className="sidebar-header">
              <h3><Sparkles size={18} className="text-secondary" style={{marginRight: '0.5rem', color: "var(--accent-primary)"}} /> LiveCollab AI</h3>
            </div>
            
            <div className="ai-prompts">
              <button className="ai-btn"><ListTodo size={14}/> Create Tasks</button>
              <button className="ai-btn"><FileText size={14}/> Summarize Board</button>
              <button className="ai-btn"><CheckSquare size={14}/> Generate Notes</button>
            </div>

            <div className="ai-chat">
              <div className="message ai-msg">
                <div className="bubble">AI assistant is connected. Summaries and tasks will appear here when generated.</div>
              </div>
              <div className="ai-input-area">
                <input type="text" placeholder="Ask AI to analyze board..." className="input-glass" />
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Control Bar */}
      <footer className="glass control-bar">
        <div className="control-group"></div>
        
        <div className="control-group center-controls">
          <button className={`control-btn ${!mediaState.mic ? 'muted' : ''}`} onClick={() => toggleMedia('mic')}>
            {mediaState.mic ? <Mic size={22} /> : <MicOff size={22} />}
          </button>
          <button className={`control-btn ${!mediaState.camera ? 'muted' : ''}`} onClick={() => toggleMedia('camera')}>
            {mediaState.camera ? <Video size={22} /> : <VideoOff size={22} />}
          </button>
          <button className={`control-btn ${mediaState.screen ? 'active-share' : ''}`} onClick={() => toggleMedia('screen')}>
            <MonitorUp size={22} />
          </button>
          <button className="control-btn"><Hand size={22} /></button>
          <button className="control-btn"><MoreHorizontal size={22} /></button>
          <button className="control-btn end-call" onClick={() => navigate('/dashboard')}><PhoneOff size={22} /></button>
        </div>

        <div className="control-group right-controls">
          <button className={`control-btn text-btn ${isAiPanelOpen ? 'active-toggle' : ''}`} onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}>
            <Sparkles size={18} style={{marginRight:'0.4rem'}}/> AI
          </button>
          <button className="control-btn"><Settings size={20} /></button>
        </div>
      </footer>
    </div>
  );
};

export default Room;
