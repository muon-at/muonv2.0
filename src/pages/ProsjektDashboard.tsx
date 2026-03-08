import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import '../styles/AvdelingDashboard.css';

interface Stats {
  dag: number;
  uke: number;
  maned: number;
}

interface Goals {
  dag: number;
  uke: number;
  maned: number;
}

const ProsjektDashboard = ({ userProject }: { userProject?: string } = {}) => {
  const proj = userProject || 'Allente';
  const [stats, setStats] = useState<Stats>({ dag: 0, uke: 0, maned: 0 });
  const [goals, setGoals] = useState<Goals>({ dag: 50, uke: 250, maned: 1000 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [proj]);

  const loadData = async () => {
    try {
      // Fetch project goals from Firestore
      // Using allente_targets but filtered by project name
      const goalsRef = collection(db, 'allente_targets');
      const q = query(goalsRef, where('project', '==', proj));
      const goalsSnap = await getDocs(q);

      if (!goalsSnap.empty) {
        const goalData = goalsSnap.docs[0].data();
        setGoals({
          dag: goalData.dag_mal || 50,
          uke: goalData.uke_mal || 250,
          maned: goalData.maned_mal || 1000,
        });
      }

      // TODO: Fetch actual sales data
      // For now, using placeholder
      setStats({ dag: 0, uke: 0, maned: 0 });

      setLoading(false);
    } catch (err) {
      console.error('Error loading projekt data:', err);
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="avdeling-dashboard">
        <p>Laster data...</p>
      </div>
    );

  return (
    <div className="avdeling-dashboard">
      <div className="avdeling-header">
        <h2>Prosjekt: {proj}</h2>
        <p className="avdeling-subtitle">Se alle kontrakter fra {proj}</p>
      </div>

      <div className="avdeling-grid">
        {/* DAG */}
        <div className="avdeling-card">
          <div className="card-title">DAG 📅</div>
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-label">SALG</span>
              <span className="stat-value">{stats.dag}</span>
            </div>
            <span className="separator">/</span>
            <div className="stat-box">
              <span className="stat-label">MÅL</span>
              <span className="stat-value">{goals.dag}</span>
            </div>
          </div>
          <div className="progress-bar-wrapper">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min((stats.dag / goals.dag) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="top-five">
            <div className="top-five-title">Top 5</div>
            <p style={{ fontSize: '0.85rem', color: '#999' }}>Data loading...</p>
          </div>
        </div>

        {/* UKE */}
        <div className="avdeling-card">
          <div className="card-title">UKE 📊</div>
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-label">SALG</span>
              <span className="stat-value">{stats.uke}</span>
            </div>
            <span className="separator">/</span>
            <div className="stat-box">
              <span className="stat-label">MÅL</span>
              <span className="stat-value">{goals.uke}</span>
            </div>
          </div>
          <div className="progress-bar-wrapper">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min((stats.uke / goals.uke) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="top-five">
            <div className="top-five-title">Top 5</div>
            <p style={{ fontSize: '0.85rem', color: '#999' }}>Data loading...</p>
          </div>
        </div>

        {/* MÅNED */}
        <div className="avdeling-card">
          <div className="card-title">MÅNED 📈</div>
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-label">SALG</span>
              <span className="stat-value">{stats.maned}</span>
            </div>
            <span className="separator">/</span>
            <div className="stat-box">
              <span className="stat-label">MÅL</span>
              <span className="stat-value">{goals.maned}</span>
            </div>
          </div>
          <div className="progress-bar-wrapper">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min((stats.maned / goals.maned) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="top-five">
            <div className="top-five-title">Top 5</div>
            <p style={{ fontSize: '0.85rem', color: '#999' }}>Data loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProsjektDashboard;
