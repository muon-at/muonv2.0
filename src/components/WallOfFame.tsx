import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { RecordsCache } from '../utils/recordsCache';
import '../styles/Plaquet.css';

interface WallOfFameProps {
  recordsCache: RecordsCache;
}

export const WallOfFame: React.FC<WallOfFameProps> = ({ recordsCache }) => {
  const [empDeptMap, setEmpDeptMap] = useState<{ [emp: string]: string }>({});
  const [krsDay, setKrsDay] = useState<{ name: string; count: number } | null>(null);
  const [krsWeek, setKrsWeek] = useState<{ name: string; count: number } | null>(null);
  const [krsMonth, setKrsMonth] = useState<{ name: string; count: number } | null>(null);

  // Load employee departments on mount
  useEffect(() => {
    const loadEmpDepts = async () => {
      try {
        const empRef = collection(db, 'employees');
        const empSnap = await getDocs(empRef);
        const map: { [emp: string]: string } = {};
        empSnap.forEach(doc => {
          const data = doc.data();
          if (data.externalName) {
            map[data.externalName] = data.department || 'Allente';
          }
        });
        console.log('✅ Emp dept map loaded:', Object.keys(map).length, 'employees');
        console.log('✅ Map:', map);
        setEmpDeptMap(map);
      } catch (err) {
        console.error('Error loading employee departments:', err);
      }
    };
    loadEmpDepts();
  }, []);

  // Calculate KRS records whenever empDeptMap or recordsCache changes
  useEffect(() => {
    if (Object.keys(empDeptMap).length === 0) {
      console.log('⏳ Waiting for emp dept map...');
      return;
    }

    console.log('🔍 Filtering records for KRS...');
    console.log('📊 recordsCache.employees:', Object.keys(recordsCache.employees || {}).length);

    // Get KRS employees
    const krsEmps = Object.entries(recordsCache.employees || {})
      .filter(([emp]) => empDeptMap[emp] === 'KRS')
      .map(([name, record]) => ({ name, dayBest: record.dayBest, weekBest: record.weekBest, monthBest: record.monthBest }));

    console.log('🏢 KRS employees found:', krsEmps.length, krsEmps);

    // Get top for each period
    if (krsEmps.length > 0) {
      const dayTop = krsEmps.reduce((a, b) => a.dayBest > b.dayBest ? a : b);
      const weekTop = krsEmps.reduce((a, b) => a.weekBest > b.weekBest ? a : b);
      const monthTop = krsEmps.reduce((a, b) => a.monthBest > b.monthBest ? a : b);

      console.log('🏆 KRS Records:', { day: dayTop, week: weekTop, month: monthTop });

      setKrsDay({ name: dayTop.name, count: dayTop.dayBest });
      setKrsWeek({ name: weekTop.name, count: weekTop.weekBest });
      setKrsMonth({ name: monthTop.name, count: monthTop.monthBest });
    }
  }, [empDeptMap, recordsCache]);

  return (
    <div className="tab-content">
      <div className="content-title">
        <h3>🏆 Wall of Fame</h3>
        <p>TEST - Only KRS Employee Plaques</p>
      </div>

      <div className="plaquet-container">
        {/* SINGLE KRS EMPLOYEE PLAQUET */}
        <div className="plaquet">
          <div className="plaquet-content">
            <div className="plaquet-trophy">🏆</div>
            <div className="plaquet-title">KRS</div>
            <div className="plaquet-subtitle">Best Employees</div>
            <div className="plaquet-records">
              <div className="plaquet-record">
                <span className="plaquet-record-label">Day:</span>
                <span className="plaquet-record-name">{krsDay ? krsDay.name.split(' ')[0] : '—'}</span>
                <span className="plaquet-record-value">{krsDay ? krsDay.count : '0'}</span>
              </div>
              <div className="plaquet-record">
                <span className="plaquet-record-label">Week:</span>
                <span className="plaquet-record-name">{krsWeek ? krsWeek.name.split(' ')[0] : '—'}</span>
                <span className="plaquet-record-value">{krsWeek ? krsWeek.count : '0'}</span>
              </div>
              <div className="plaquet-record">
                <span className="plaquet-record-label">Month:</span>
                <span className="plaquet-record-name">{krsMonth ? krsMonth.name.split(' ')[0] : '—'}</span>
                <span className="plaquet-record-value">{krsMonth ? krsMonth.count : '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DEBUG INFO */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px', fontSize: '0.85rem' }}>
        <div>📊 recordsCache.employees: {Object.keys(recordsCache.employees || {}).length}</div>
        <div>🔗 empDeptMap: {Object.keys(empDeptMap).length}</div>
        <div>🏢 KRS Day: {krsDay ? `${krsDay.name} ${krsDay.count}` : 'Loading...'}</div>
        <div>📈 KRS Week: {krsWeek ? `${krsWeek.name} ${krsWeek.count}` : 'Loading...'}</div>
        <div>📊 KRS Month: {krsMonth ? `${krsMonth.name} ${krsMonth.count}` : 'Loading...'}</div>
      </div>
    </div>
  );
};
