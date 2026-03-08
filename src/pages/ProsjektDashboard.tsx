import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import '../styles/AvdelingDashboard.css';

interface TopFiveItem {
  name: string;
  salg: number;
}

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

interface TopFive {
  dag: TopFiveItem[];
  uke: TopFiveItem[];
  maned: TopFiveItem[];
}

const ProsjektDashboard = ({ userProject }: { userProject?: string } = {}) => {
  const proj = userProject || 'Allente';
  const [stats, setStats] = useState<Stats>({ dag: 0, uke: 0, maned: 0 });
  const [goals, setGoals] = useState<Goals>({ dag: 50, uke: 250, maned: 1000 });
  const [topFive, setTopFive] = useState<TopFive>({ dag: [], uke: [], maned: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [proj]);

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
    return new Date(dateStr);
  };

  const loadData = async () => {
    try {
      const today = new Date();

      // Fetch project goals
      const goalsRef = collection(db, 'allente_targets');
      const goalsQuery = query(goalsRef, where('project', '==', proj));
      const goalsSnap = await getDocs(goalsQuery);

      if (!goalsSnap.empty) {
        const goalData = goalsSnap.docs[0].data();
        setGoals({
          dag: goalData.dag_mal || 50,
          uke: goalData.uke_mal || 250,
          maned: goalData.maned_mal || 1000,
        });
      }

      // Fetch all employees from project
      const employeesRef = collection(db, 'employees');
      const employeesQuery = query(employeesRef, where('project', '==', proj));
      const employeesSnap = await getDocs(employeesQuery);
      const employees = employeesSnap.docs.map(doc => doc.data());

      // Fetch all sales
      const salesRef = collection(db, 'allente_salg');
      const salesSnap = await getDocs(salesRef);
      const allSales = salesSnap.docs.map(doc => doc.data());

      // Count sales by employee
      const salesByEmployee = new Map<string, { dag: number; uke: number; maned: number }>();

      // Initialize with all employees
      employees.forEach(emp => {
        salesByEmployee.set(emp.externalName, { dag: 0, uke: 0, maned: 0 });
      });

      // Fetch emoji counts for today (DAG)
      const todayStr = today.toISOString().split('T')[0];
      const emojiCountsRef = collection(db, 'emoji_counts_daily', todayStr, 'employees');
      const emojiCountsSnap = await getDocs(emojiCountsRef);
      const emojiCounts = new Map<string, number>();

      emojiCountsSnap.docs.forEach(doc => {
        const data = doc.data();
        const bellCount = (data['🔔'] || 0) as number;
        const gemCount = (data['💎'] || 0) as number;
        const totalEmojis = bellCount + gemCount;
        emojiCounts.set(doc.id, totalEmojis);
      });

      // Set DAG counts from emoji data
      emojiCounts.forEach((count, empName) => {
        const current = salesByEmployee.get(empName) || { dag: 0, uke: 0, maned: 0 };
        current.dag = count;
        salesByEmployee.set(empName, current);
      });

      // Process sales for week and month
      allSales.forEach((sale: any) => {
        const selgerKey = sale.selger?.trim();
        if (!selgerKey) return;

        const saleDate = parseDate(sale.dato);
        if (!saleDate || saleDate.getTime() === 0) return;

        // Count for this week
        const weekStart = new Date(today);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        weekStart.setDate(diff);

        if (saleDate >= weekStart && saleDate <= today) {
          const current = salesByEmployee.get(selgerKey) || { dag: 0, uke: 0, maned: 0 };
          current.uke += 1;
          salesByEmployee.set(selgerKey, current);
        }

        // Count for this month
        if (saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear()) {
          const current = salesByEmployee.get(selgerKey) || { dag: 0, uke: 0, maned: 0 };
          current.maned += 1;
          salesByEmployee.set(selgerKey, current);
        }
      });

      // Calculate totals
      let totalDag = 0;
      let totalUke = 0;
      let totalManed = 0;

      const dagList: TopFiveItem[] = [];
      const ukeList: TopFiveItem[] = [];
      const maanedList: TopFiveItem[] = [];

      salesByEmployee.forEach((counts, empName) => {
        totalDag += counts.dag;
        totalUke += counts.uke;
        totalManed += counts.maned;

        dagList.push({ name: empName, salg: counts.dag });
        ukeList.push({ name: empName, salg: counts.uke });
        maanedList.push({ name: empName, salg: counts.maned });
      });

      dagList.sort((a, b) => b.salg - a.salg);
      ukeList.sort((a, b) => b.salg - a.salg);
      maanedList.sort((a, b) => b.salg - a.salg);

      setStats({ dag: totalDag, uke: totalUke, maned: totalManed });
      setTopFive({
        dag: dagList.slice(0, 5),
        uke: ukeList.slice(0, 5),
        maned: maanedList.slice(0, 5),
      });

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
            {topFive.dag.length > 0 ? (
              topFive.dag.map((emp, idx) => (
                <div key={idx} className="top-five-item">
                  <span className="rank">{idx + 1}.</span>
                  <span className="name">{emp.name}</span>
                  <span className="count">{emp.salg}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#999' }}>Ingen salg i dag</p>
            )}
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
            {topFive.uke.length > 0 ? (
              topFive.uke.map((emp, idx) => (
                <div key={idx} className="top-five-item">
                  <span className="rank">{idx + 1}.</span>
                  <span className="name">{emp.name}</span>
                  <span className="count">{emp.salg}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#999' }}>Ingen salg denne uka</p>
            )}
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
            {topFive.maned.length > 0 ? (
              topFive.maned.map((emp, idx) => (
                <div key={idx} className="top-five-item">
                  <span className="rank">{idx + 1}.</span>
                  <span className="name">{emp.name}</span>
                  <span className="count">{emp.salg}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#999' }}>Ingen salg denne måneden</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProsjektDashboard;
