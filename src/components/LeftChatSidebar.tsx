import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import { useChatSidebar } from '../lib/ChatSidebarContext';
import '../styles/LeftChatSidebar.css';

interface LeftChatSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const LeftChatSidebar: React.FC<LeftChatSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setIsChatSidebarOpen } = useChatSidebar();

  const handleChannelClick = (channelId: string) => {
    navigate('/chat', { state: { selectedChannel: channelId } });
    setIsChatSidebarOpen(false);
  };

  const handleDMClick = () => {
    navigate('/chat', { state: { selectedDM: 'list' } });
    setIsChatSidebarOpen(false);
  };

  return (
    <div className={`left-chat-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        CHAT
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {/* GLOBAL */}
      <div className="channel-section">
        <button 
          className="channel-button"
          onClick={() => handleChannelClick('global')}
          title="Global"
        >
          <span className="channel-icon">🌐</span>
        </button>
      </div>

      {/* DEPARTMENTS (Owner only) */}
      {user?.role === 'owner' && (
        <div className="channel-section">
          <button 
            className="channel-circle"
            onClick={() => handleChannelClick('dept-krs')}
            title="KRS"
          >
            KRS
          </button>
          <button 
            className="channel-circle"
            onClick={() => handleChannelClick('dept-osl')}
            title="OSL"
          >
            OSL
          </button>
          <button 
            className="channel-circle"
            onClick={() => handleChannelClick('dept-skien')}
            title="SKN"
          >
            SKN
          </button>
        </div>
      )}

      {/* USER'S DEPARTMENT (non-owner) */}
      {user?.department && user.department !== 'MUON' && user?.role !== 'owner' && (
        <div className="channel-section">
          <button 
            className="channel-circle"
            onClick={() => handleChannelClick(`dept-${(user.department || '').toLowerCase()}`)}
            title={user.department}
          >
            {user.department === 'KRS' ? 'KRS' : user.department === 'OSL' ? 'OSL' : 'SKN'}
          </button>
        </div>
      )}

      {/* DM */}
      <div className="channel-section">
        <button 
          className="channel-button"
          onClick={handleDMClick}
          title="Direct Messages"
        >
          <span className="channel-icon">💬</span>
        </button>
      </div>

      {/* PROJECTS */}
      {user?.project && (
        <div className="channel-section">
          <button 
            className="channel-button"
            onClick={() => handleChannelClick('project-allente')}
            title="Allente"
          >
            <span className="channel-icon">📊</span>
          </button>
        </div>
      )}

      {/* TEAMS */}
      {(user?.role === 'owner' || user?.role === 'teamleder') && (
        <div className="channel-section">
          <button 
            className="channel-button"
            onClick={() => handleChannelClick('team')}
            title="Teamledere"
          >
            <span className="channel-icon">👥</span>
          </button>
        </div>
      )}

      {/* ADMIN */}
      {user?.role === 'owner' && (
        <div className="channel-section">
          <button 
            className="channel-button"
            onClick={() => handleChannelClick('admin')}
            title="Admin"
          >
            <span className="channel-icon">🔒</span>
          </button>
        </div>
      )}

      {/* Overlay (mobile) */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}
    </div>
  );
};
