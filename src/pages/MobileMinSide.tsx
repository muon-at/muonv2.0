import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import '../styles/MobileMinSide.css';

export default function MobileMinSide() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Load employee data
        const employeesRef = collection(db, 'employees');
        const q = query(employeesRef, where('userId', '==', user.id));
        const snapshot = await getDocs(q);
        
        if (snapshot.size > 0) {
          const empData = snapshot.docs[0].data();
          setData(empData);
        }

        // Load badges
        const badgesRef = collection(db, 'user_earned_badges');
        const badgesQ = query(badgesRef, where('userId', '==', user.id));
        const badgesSnapshot = await getDocs(badgesQ);
        const badgesList: any[] = [];
        badgesSnapshot.forEach(doc => {
          badgesList.push(doc.data());
        });
        setBadges(badgesList);

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="mobile-min-side">
        <div className="mobile-header">
          <button className="back-button" onClick={() => navigate('/home')}>
            ← Tilbake
          </button>
          <h1>Min Side</h1>
          <div style={{ width: '40px' }} />
        </div>
        <div style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
          Laster...
        </div>
      </div>
    );
  }

  // Record circles (best of each period - NO kr)
  const besteDag = data?.besteDag || 0;
  const besteUke = data?.besteUke || 0;
  const besteMåned = data?.besteMåned || 0;
  const besteÅr = data?.besteÅr || 0;
  const totaltEarnings = data?.totalEarnings || 0;

  // Progress: Count goals completed (not percentage)
  const weeklyGoal = data?.weeklyGoal || 10000;
  const monthlyGoal = data?.monthlyGoal || 40000;
  const dagGoal = weeklyGoal / 5;

  const goalsCompleted = {
    dag: (data?.status || 0) >= dagGoal ? 1 : 0,
    uke: (data?.weeklyStatus || 0) >= weeklyGoal ? 1 : 0,
    måned: (data?.monthlyStatus || 0) >= monthlyGoal ? 1 : 0
  };

  // Runrate (same as desktop - NO kr)
  const ukeRunrate = data?.weekRunrate || 0;
  const månedRunrate = data?.monthRunrate || 0;

  return (
    <div className="mobile-min-side">
      <div className="mobile-header">
        <button className="back-button" onClick={() => navigate('/home')}>
          ← Tilbake
        </button>
        <h1>Min Side</h1>
        <div style={{ width: '40px' }} />
      </div>

      <div className="mobile-min-side-content">
        {/* REKORDER - Circles (BESTE DAG | UKE | MÅNED | ÅR | TOTALT) - NO kr */}
        <div className="rekorder-row">
          <div className="rekord-circle">
            <div className="circle-number">{besteDag}</div>
            <div className="circle-label">BESTE DAG</div>
          </div>
          <div className="rekord-circle">
            <div className="circle-number">{besteUke}</div>
            <div className="circle-label">BESTE UKE</div>
          </div>
          <div className="rekord-circle">
            <div className="circle-number">{besteMåned}</div>
            <div className="circle-label">BESTE MND</div>
          </div>
          <div className="rekord-circle">
            <div className="circle-number">{besteÅr}</div>
            <div className="circle-label">BESTE ÅR</div>
          </div>
          <div className="rekord-circle">
            <div className="circle-number">{totaltEarnings}</div>
            <div className="circle-label">TOTALT</div>
          </div>
        </div>

        {/* PROGRESS BARS - Goals Completed */}
        <div className="progress-section">
          <div className="progress-item">
            <label>DAG</label>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${(goalsCompleted.dag / 1) * 100}%` }} />
            </div>
            <div className="progress-text">{goalsCompleted.dag} of 1 goal</div>
          </div>

          <div className="progress-item">
            <label>UKE</label>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${(goalsCompleted.uke / 1) * 100}%` }} />
            </div>
            <div className="progress-text">{goalsCompleted.uke} of 1 goal</div>
          </div>

          <div className="progress-item">
            <label>MÅNED</label>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${(goalsCompleted.måned / 1) * 100}%` }} />
            </div>
            <div className="progress-text">{goalsCompleted.måned} of 1 goal</div>
          </div>
        </div>

        {/* RUNRATE - NO kr */}
        <div className="runrate-section">
          <div className="runrate-box">
            <div className="runrate-label">RUNRATE UKE</div>
            <div className="runrate-value">{ukeRunrate}</div>
          </div>
          <div className="runrate-box">
            <div className="runrate-label">RUNRATE MÅNED</div>
            <div className="runrate-value">{månedRunrate}</div>
          </div>
        </div>

        {/* BADGES */}
        {badges.length > 0 && (
          <div className="badges-section">
            <h3>BADGES</h3>
            <div className="badges-grid">
              {badges.map((badge, idx) => (
                <div key={idx} className="badge-item" title={badge.name}>
                  {badge.emoji || '🏅'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
