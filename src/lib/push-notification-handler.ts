// Push Notification Handler for Chat Messages
// Web Push API for guaranteed notifications (even when app is closed)

import { db } from './firebase';
import { collection, onSnapshot, query, orderBy, limit, doc, setDoc } from 'firebase/firestore';

/**
 * Request notification permission from user
 * Call this on app startup or when user opens chat
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    console.log('✅ Notifications already granted');
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('⚠️ Notifications denied by user');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('🔔 Notification permission:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Subscribe to new messages for a specific user
 * Triggers notification when new message arrives
 * 
 * TODO: Valg B - Replace with backend Web Push API call
 * const response = await fetch('/api/push-subscribe', {
 *   method: 'POST',
 *   body: JSON.stringify({ userId, subscription })
 * });
 */
export const subscribeToMessages = (userId: string, onNewMessage: (message: any) => void) => {
  if (!userId) {
    console.warn('Cannot subscribe to messages: no userId');
    return () => {};
  }

  console.log('📬 Subscribing to messages for user:', userId);

  // Query: messages sent to this user (in DMs and channels they're in)
  // For now, just listen to all messages - will be filtered by recipient
  const messagesRef = collection(db, 'chat_messages');
  
  // Create query for messages (you may need to adjust based on your schema)
  const q = query(
    messagesRef,
    orderBy('timestamp', 'desc'),
    limit(100)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const message = change.doc.data();
        
        // Only notify if message is for this user and not sent by them
        if (message.recipientId === userId && message.senderId !== userId) {
          console.log('🔔 New message received:', message);
          onNewMessage(message);
          
          // Show notification
          showNotification(message);
          
          // Play sound + vibrate
          playNotificationSound();
          vibrateDevice();
        }
      }
    });
  }, (error) => {
    console.error('❌ Error subscribing to messages:', error);
  });

  return unsubscribe;
};

/**
 * Show browser notification
 */
export const showNotification = (message: any) => {
  if (Notification.permission !== 'granted') {
    console.warn('Notifications not permitted');
    return;
  }

  const title = message.senderName || 'Ny melding';
  const options = {
    body: message.text?.substring(0, 100) || 'Du har fått en ny melding',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: `chat-${message.senderId}`, // Allows replacing old notifications
    requireInteraction: false, // Auto-dismiss after 4 seconds
    silent: false, // Show in notification center
  };

  try {
    new Notification(title, options);
    console.log('✅ Notification shown:', title);
  } catch (error) {
    console.error('❌ Error showing notification:', error);
  }
};

/**
 * Play notification sound
 * Uses Web Audio API for cross-browser support
 */
export const playNotificationSound = () => {
  try {
    // Create simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Brief beep: 1000Hz for 200ms
    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);

    console.log('🔊 Notification sound played');
  } catch (error) {
    console.warn('⚠️ Could not play notification sound:', error);
  }
};

/**
 * Vibrate device (iOS/Android)
 */
export const vibrateDevice = () => {
  if (navigator.vibrate) {
    // Vibrate pattern: 100ms vibrate, 50ms pause, 100ms vibrate
    navigator.vibrate([100, 50, 100]);
    console.log('📳 Device vibrated');
  }
};

/**
 * TODO: VALG B - Backend Web Push API Integration
 * 
 * When ready to upgrade, implement:
 * 1. Get VAPID public key from backend
 * 2. Subscribe to push notifications:
 *    const subscription = await serviceWorkerRegistration.pushManager.subscribe({
 *      userVisibleOnly: true,
 *      applicationServerKey: urlB64ToUint8Array(vapidPublicKey)
 *    });
 * 3. Send subscription to backend
 * 4. Backend sends push events via Web Push API
 * 5. Service Worker handles push events:
 *    self.addEventListener('push', (event) => {
 *      const data = event.data.json();
 *      self.registration.showNotification(data.title, data.options);
 *    });
 */

export const setupValg_B_WebPush = async () => {
  console.log('TODO: Setup Valg B Web Push when backend is ready');
};

/**
 * Subscribe device to Web Push notifications
 * Guarantees notification even when app is closed
 * VAPID public key from environment
 */
export const subscribeToWebPush = async (userId: string): Promise<PushSubscription | null> => {
  try {
    // Check if browser supports Push API
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Browser does not support Web Push');
      return null;
    }

    // VAPID public key from environment variables
    const VAPID_PUBLIC_KEY = 'BBo0I4DuK1Sk-MExUGj7UrgE2y4HTgAGO6nisAQxJu4TFYUiPb1IEOwRk0ZYr4YmtEx_Ag256ogjznbuKLw9NtU';

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('✅ Subscribed to Web Push:', subscription);
    }

    // Store subscription in Firestore under user document
    if (subscription && userId) {
      await setDoc(
        doc(db, 'push_subscriptions', userId),
        {
          subscription: subscription.toJSON(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      
      console.log('✅ Push subscription stored in Firestore');
    }

    return subscription;
  } catch (error) {
    console.error('❌ Error subscribing to Web Push:', error);
    return null;
  }
};

/**
 * Helper function: Convert VAPID key from base64url to Uint8Array
 */
function urlB64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Unsubscribe from Web Push
 */
export const unsubscribeFromWebPush = async (): Promise<void> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('✅ Unsubscribed from Web Push');
    }
  } catch (error) {
    console.error('❌ Error unsubscribing from Web Push:', error);
  }
};
