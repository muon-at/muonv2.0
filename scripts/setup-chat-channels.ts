import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDJTDdfmF7L2j7HGJKzGVK4_5_jGZo8uMQ',
  authDomain: 'brukerstats-dashboard.firebaseapp.com',
  projectId: 'brukerstats-dashboard',
  storageBucket: 'brukerstats-dashboard.appspot.com',
  messagingSenderId: '969643127889',
  appId: '1:969643127889:web:cf6e5d1e3d0fb40e9532d8',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const channels = [
  { name: 'general', type: 'global' },
  { name: 'allente', type: 'project' },
  { name: 'krs-team', type: 'team' },
  { name: 'team', type: 'team' },
  { name: 'admin', type: 'admin' },
  { name: 'krs', type: 'avdeling', avdeling: 'KRS' },
  { name: 'osl', type: 'avdeling', avdeling: 'OSL' },
  { name: 'skien', type: 'avdeling', avdeling: 'Skien' },
];

async function setupChannels() {
  try {
    for (const channel of channels) {
      await addDoc(collection(db, 'chat_channels'), {
        name: channel.name,
        type: channel.type,
        avdeling: (channel as any).avdeling || null,
        createdAt: new Date(),
      });
      console.log(`✅ Created #${channel.name}`);
    }
    console.log('\n🎉 All channels created!');
  } catch (err) {
    console.error('Error creating channels:', err);
  }
}

setupChannels();
