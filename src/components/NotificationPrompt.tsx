import { useEffect, useState } from 'react';
import { useAuth } from '../lib/authContext';
import { requestNotificationPermission, subscribeToWebPush } from '../lib/push-notification-handler';

export default function NotificationPrompt() {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    // Check if user has already been prompted
    const hasBeenPrompted = localStorage.getItem('notification_prompt_shown');
    
    // Show prompt only if:
    // 1. User is logged in
    // 2. We haven't shown the prompt yet
    // 3. Browser supports notifications
    if (user && !hasBeenPrompted && 'Notification' in window) {
      setShowPrompt(true);
      localStorage.setItem('notification_prompt_shown', 'true');
    }
  }, [user]);

  const handleAllow = async () => {
    setRequesting(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted && user) {
        await subscribeToWebPush(user.id);
        console.log('✅ Push notifications enabled!');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setRequesting(false);
      setShowPrompt(false);
    }
  };

  const handleDeny = () => {
    console.log('User declined notifications');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      background: '#2a2a2a',
      border: '2px solid #667eea',
      borderRadius: '8px',
      padding: '1rem',
      maxWidth: '300px',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    }}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#ffffff', fontSize: '1rem' }}>🔔 Push Notifications</h3>
      <p style={{ margin: '0 0 1rem 0', color: '#aaa', fontSize: '0.9rem' }}>
        Motta varsler når du får meldinger, selv når appen er lukket.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleAllow}
          disabled={requesting}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: requesting ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            opacity: requesting ? 0.6 : 1,
          }}
        >
          {requesting ? 'Aktiverer...' : 'Tillat'}
        </button>
        <button
          onClick={handleDeny}
          disabled={requesting}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: '#444',
            color: '#aaa',
            border: 'none',
            borderRadius: '6px',
            cursor: requesting ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            opacity: requesting ? 0.6 : 1,
          }}
        >
          Avslå
        </button>
      </div>
    </div>
  );
}
