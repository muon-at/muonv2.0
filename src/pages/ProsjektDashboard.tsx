import { useEffect } from 'react';
import '../styles/AvdelingDashboard.css';

const ProsjektDashboard = ({ userProject }: { userProject?: string } = {}) => {
  useEffect(() => {
    // Load data here
  }, []);

  return (
    <div className="avdeling-dashboard">
      <div className="avdeling-header">
        <h2>Prosjekt: {userProject || 'Allente'}</h2>
        <p className="avdeling-subtitle">Se alle kontrakter fra {userProject || 'Allente'}</p>
      </div>

      <div className="avdeling-grid">
        {/* DAG */}
        <div className="avdeling-card">
          <div className="card-title">DAG 📅</div>
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-label">SALG</span>
              <span className="stat-value">0</span>
            </div>
            <span className="separator">/</span>
            <div className="stat-box">
              <span className="stat-label">MÅL</span>
              <span className="stat-value">50</span>
            </div>
          </div>
          <div className="progress-bar-wrapper">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
          </div>
          <div className="top-five">
            <div className="top-five-title">Top 5</div>
            <p style={{ fontSize: '0.85rem', color: '#999' }}>Laster data...</p>
          </div>
        </div>

        {/* UKE */}
        <div className="avdeling-card">
          <div className="card-title">UKE 📊</div>
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-label">SALG</span>
              <span className="stat-value">0</span>
            </div>
            <span className="separator">/</span>
            <div className="stat-box">
              <span className="stat-label">MÅL</span>
              <span className="stat-value">250</span>
            </div>
          </div>
          <div className="progress-bar-wrapper">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
          </div>
          <div className="top-five">
            <div className="top-five-title">Top 5</div>
            <p style={{ fontSize: '0.85rem', color: '#999' }}>Laster data...</p>
          </div>
        </div>

        {/* MÅNED */}
        <div className="avdeling-card">
          <div className="card-title">MÅNED 📈</div>
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-label">SALG</span>
              <span className="stat-value">0</span>
            </div>
            <span className="separator">/</span>
            <div className="stat-box">
              <span className="stat-label">MÅL</span>
              <span className="stat-value">1000</span>
            </div>
          </div>
          <div className="progress-bar-wrapper">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
          </div>
          <div className="top-five">
            <div className="top-five-title">Top 5</div>
            <p style={{ fontSize: '0.85rem', color: '#999' }}>Laster data...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProsjektDashboard;
