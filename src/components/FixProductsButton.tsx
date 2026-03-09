import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

export function FixProductsButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const fixProducts = async () => {
    setLoading(true);
    try {
      const productsRef = collection(db, 'allente_products');
      const snap = await getDocs(productsRef);
      const batch = writeBatch(db);
      
      // Map of product bases to their correct provisjon
      const provisjonMap: { [key: string]: number } = {
        '"Flex 2 with ads': 600,
        '"Flex 2 without ads': 600,
        '"Flex Basic': 500,
        '"Basic': 500,
        '"Standard': 800,
        '"Large': 1000,
      };
      
      let count = 0;

      snap.forEach(docSnap => {
        const oldId = docSnap.id;
        const newId = oldId
          .replace(/måneder/g, 'mneder')
          .replace(/måned/g, 'mned');
        
        if (oldId !== newId) {
          // Find correct provisjon based on product base
          let correctProv = 0;
          for (const [base, prov] of Object.entries(provisjonMap)) {
            if (newId.startsWith(base)) {
              correctProv = prov;
              break;
            }
          }
          
          batch.delete(doc(db, 'allente_products', oldId));
          batch.set(doc(db, 'allente_products', newId), {
            provisjon: correctProv
          });
          count++;
          console.log(`✅ ${count}: "${oldId}" → "${newId}" (${correctProv} kr)`);
        }
      });

      await batch.commit();
      console.log(`✅ FERDIG! ${count} produkter oppdatert med riktig provisjon!`);
      setDone(true);
    } catch (err: any) {
      console.error('❌ Error:', err);
      alert('Error: ' + (err?.message || 'Unknown error'));
    }
    setLoading(false);
  };

  if (done) {
    return <div className="p-4 bg-green-900 text-green-100 rounded">✅ Produkter fikset!</div>;
  }

  return (
    <button
      onClick={fixProducts}
      disabled={loading}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
    >
      {loading ? 'Fikser...' : '🔧 FIX PRODUCTS (måneder → mneder)'}
    </button>
  );
}
