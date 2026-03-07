import { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import '../styles/MinSide.css';

interface SalesRecord {
  dato?: string;
  selger?: string;
  id?: string;
}

const allBadges = ['🏆', '🎓', '🚀', '🎯', '🔥', '⚡', '💎', '👑', '🌟', '🎪', '🎨', '🎭', '🎬', '🎸', '🎺'];

const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date(0);
  const trimmed = dateStr.trim();
  
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  const ddmmyyyy2Match = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (ddmmyyyy2Match) {
    const [, day, month, year] = ddmmyyyy2Match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  return new Date(dateStr);
};

export default function MinSide() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [badgeStatus, setBadgeStatus] = useState<{ [key: string]: boolean }>({});
  const [weeklyGoal, setWeeklyGoal] = useState<number>(0);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(0);
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    loadEmployeeData();
  }, [user]);

  const loadEmployeeData = async () => {
    try {
      const salesRef = collection(db, 'allente_kontraktsarkiv');
      const snapshot = await getDocs(salesRef);
      
      const contracts: SalesRecord[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        contracts.push({ id: doc.id, ...data });
      });

      // Filter for this employee
      const employeeContracts = contracts.filter(c => {
        const selger = c.selger || '';
        const externalName = user?.externalName || '';
        return selger === externalName || selger.startsWith(externalName + ' /');
      });

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const salesToday = employeeContracts.filter(c => {
        const date = parseDate(c.dato || '');
        return date && date.getTime() === today.getTime();
      }).length;

      const salesThisWeek = employeeContracts.filter(c => {
        const date = parseDate(c.dato || '');
        return date && date >= weekStart && date <= today;
      }).length;

      const salesThisMonth = employeeContracts.filter(c => {
        const date = parseDate(c.dato || '');
        return date && date >= monthStart && date <= today;
      }).length;

      const avgPerDay = Math.round(employeeContracts.length / 365);
      const total = employeeContracts.length;

      setStats([
        { value: salesToday, label: 'Dag', color: '#E8956E', icon: '📊' },
        { value: salesThisWeek, label: 'Uke', color: '#E8956E', icon: '📈' },
        { value: salesThisMonth, label: 'Måned', color: '#E8956E', icon: '🎯' },
        { value: avgPerDay, label: 'År', color: '#5B7FFF', icon: '📅' },
        { value: total, label: 'Altid', color: '#A855C9', icon: '⭐' },
      ]);

      // Calculate badges - track which ones are earned
      const earnedBadgesList: { badge: string; earned: boolean }[] = [];
      
      // Badge 0: 🏆 (Trophy) - 100+ total
      earnedBadgesList.push({ badge: allBadges[0], earned: total >= 100 });
      
      // Badge 1: 🎓 (Education) - 1+ total
      earnedBadgesList.push({ badge: allBadges[1], earned: total > 0 });
      
      // Badge 2: 🚀 (Rocket) - 5+ today
      earnedBadgesList.push({ badge: allBadges[2], earned: salesToday >= 5 });
      
      // Badge 3: 🎯 (Target) - 10+ today
      earnedBadgesList.push({ badge: allBadges[3], earned: salesToday >= 10 });
      
      // Badge 4: 🔥 (Fire) - 15+ today
      earnedBadgesList.push({ badge: allBadges[4], earned: salesToday >= 15 });
      
      // Badge 5: ⚡ (Lightning) - 20+ today
      earnedBadgesList.push({ badge: allBadges[5], earned: salesToday >= 20 });
      
      // Additional badges (all unearned for now - can add logic later)
      for (let i = 6; i < allBadges.length; i++) {
        earnedBadgesList.push({ badge: allBadges[i], earned: false });
      }

      console.log('📊 Min Side Badges:', { salesToday, total, earnedBadgesList });
      setEarnedBadges(earnedBadgesList.map(b => b.badge));
      
      // Store earned status map for styling
      const statusMap: { [key: string]: boolean } = {};
      earnedBadgesList.forEach(b => {
        statusMap[b.badge] = b.earned;
      });
      setBadgeStatus(statusMap);
      console.log('✅ Badge Status Map:', statusMap);
      setLoading(false);
    } catch (err) {
      console.error('Error loading employee data:', err);
      setLoading(false);
    }
  };

  if (loading) return <div className="minside-container"><div style={{ padding: '2rem', textAlign: 'center' }}>Laster...</div></div>;

  console.log('🏅 Rendering MinSide with earnedBadges:', earnedBadges);

  return (
    <div className="minside-container">
      {/* HEADER - SHOW USER NAME + ROLE + EARNED BADGES */}
      <div className="page-header-standard minside-header-large">
        <div className="header-left">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <h1>{user?.name}</h1>
              {/* All Badges in Header - Earned and Unearned */}
              {earnedBadges.length > 0 && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {earnedBadges.map((badge, idx) => {
                    const isEarned = badgeStatus[badge] !== false; // Treat undefined as earned for backwards compat
                    return (
                      <span 
                        key={idx} 
                        style={{ 
                          fontSize: '2rem', 
                          lineHeight: '1',
                          opacity: isEarned ? 1 : 0.3,
                          filter: isEarned ? 'none' : 'grayscale(100%)',
                          transition: 'opacity 0.3s ease'
                        }} 
                        title={isEarned ? `Badge ${idx + 1} - Earned` : `Badge ${idx + 1} - Locked`}
                      >
                        {badge}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <p className="subtitle">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="main-tabs">
        <button 
          className={`main-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Mine Stats
        </button>
        <button 
          className={`main-tab ${activeTab === 'avd' ? 'active' : ''}`}
          onClick={() => setActiveTab('avd')}
        >
          🏢 Min Avdeling
        </button>
        <button 
          className={`main-tab ${activeTab === 'project' ? 'active' : ''}`}
          onClick={() => setActiveTab('project')}
        >
          💼 Prosjekt
        </button>
      </div>



      {/* MAIN CONTENT */}
      {activeTab === 'stats' && (
      <div className="minside-main">
        <div className="stats-circles">
          <div className="trophy-placeholder">🏆</div>
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-circle" style={{ backgroundColor: stat.color }}>
              <div className="stat-number">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
          <div className="trophy-placeholder">🏆</div>
        </div>

        <div className="goals-sidebar">
          <div className="goals-header">
            <span style={{ fontSize: '1.2rem' }}>🎯</span>
            <div>
              <h3>Mine Mål</h3>
              <p>Ukesmål & Månedsmål</p>
            </div>
          </div>

          <div className="goals-stats">
            <div className="goal-stat">
              <span className="goal-label">UKESMÅL</span>
              <span className="goal-value">{weeklyGoal}</span>
              <span className="goal-unit">ordrer/uke</span>
            </div>
            <div className="goal-stat">
              <span className="goal-label">MÅNEDSMÅL</span>
              <span className="goal-value">{monthlyGoal}</span>
              <span className="goal-unit">ordrer/måned</span>
            </div>
          </div>

          <button className="edit-goals-btn" onClick={() => setShowGoalEdit(!showGoalEdit)}>
            Endre mål
          </button>

          {showGoalEdit && (
            <div className="goal-edit-form">
              <input 
                type="number" 
                value={weeklyGoal} 
                onChange={(e) => setWeeklyGoal(parseInt(e.target.value))}
                placeholder="Ukesmål"
              />
              <input 
                type="number" 
                value={monthlyGoal} 
                onChange={(e) => setMonthlyGoal(parseInt(e.target.value))}
                placeholder="Månedsmål"
              />
            </div>
          )}
        </div>
      </div>
      )}

      {activeTab === 'avd' && (
      <div className="tab-content">
        <div className="content-title">
          <h3>Avdeling: {user?.department}</h3>
          <p className="content-subtitle">Se alle kontrakter fra {user?.department}</p>
        </div>
        <p>Innhold for avdeling kommer snart...</p>
      </div>
      )}

      {activeTab === 'project' && (
      <div className="tab-content">
        <div className="content-title">
          <h3>Prosjekt: {user?.project}</h3>
          <p className="content-subtitle">Se alle kontrakter fra prosjektet ditt</p>
        </div>
        <p>Innhold for prosjekt kommer snart...</p>
      </div>
      )}

      {activeTab === 'stats' && (
      <>

      {/* PROGRESS BARS */}
      <div className="progress-section">
        <div className="progress-item">
          <div className="progress-label">
            <span>Dagens Mål</span>
            <span>100%</span>
          </div>
          <div className="progress-bar blue">
            <div className="progress-fill" style={{ width: '100%' }}></div>
          </div>
          <div className="progress-text">4 / 33 <span className="checkmark">✓ Mål nådd</span></div>
        </div>

        <div className="progress-item">
          <div className="progress-label">
            <span>Ukes Mål</span>
            <span>100%</span>
          </div>
          <div className="progress-bar green">
            <div className="progress-fill" style={{ width: '100%' }}></div>
          </div>
          <div className="progress-text">32 / 25 <span className="checkmark">✓ Mål nådd</span></div>
        </div>

        <div className="progress-item">
          <div className="progress-label">
            <span>Måneds Mål</span>
            <span>100%</span>
          </div>
          <div className="progress-bar orange">
            <div className="progress-fill" style={{ width: '100%' }}></div>
          </div>
          <div className="progress-text">103 / 100 <span className="checkmark">✓ Mål nådd</span></div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
