import React from 'react';
import type { RecordsCache } from '../utils/recordsCache';
import '../styles/Plaquet.css';

interface WallOfFameProps {
  recordsCache: RecordsCache;
}

export const WallOfFame: React.FC<WallOfFameProps> = ({ recordsCache }) => {
  const getTopRecordForDept = (_dept: string, period: 'dayBest' | 'weekBest' | 'monthBest') => {
    const records = Object.entries(recordsCache.employees || {})
      .filter(() => true) // Show top across all
      .sort((a, b) => b[1][period] - a[1][period]);
    return records[0];
  };

  const depts = ['KRS', 'OSL', 'Skien', 'Allente'];
  const empRecords = depts.map(dept => ({
    name: dept,
    day: getTopRecordForDept(dept, 'dayBest'),
    week: getTopRecordForDept(dept, 'weekBest'),
    month: getTopRecordForDept(dept, 'monthBest'),
  }));

  const deptRecords = depts.map(dept => ({
    name: dept,
    record: recordsCache.departments?.[dept] || { dayBest: 0, weekBest: 0, monthBest: 0 },
  }));

  return (
    <div className="tab-content">
      <div className="content-title">
        <h3>🏆 Wall of Fame</h3>
        <p>All-time records - Beautiful plaques</p>
      </div>

      <div className="plaquet-container">
        {/* EMPLOYEE PLAQUES */}
        {empRecords.map((dept) => (
          <div key={`emp-${dept.name}`} className="plaquet">
            <div className="plaquet-content">
              <div className="plaquet-trophy">🏆</div>
              <div className="plaquet-title">{dept.name}</div>
              <div className="plaquet-subtitle">Best Employees</div>
              <div className="plaquet-records">
                <div className="plaquet-record">
                  <span className="plaquet-record-label">Day:</span>
                  <span className="plaquet-record-name">{dept.day ? dept.day[0].split(' ')[0] : '—'}</span>
                  <span className="plaquet-record-value">{dept.day ? dept.day[1].dayBest : '0'}</span>
                </div>
                <div className="plaquet-record">
                  <span className="plaquet-record-label">Week:</span>
                  <span className="plaquet-record-name">{dept.week ? dept.week[0].split(' ')[0] : '—'}</span>
                  <span className="plaquet-record-value">{dept.week ? dept.week[1].weekBest : '0'}</span>
                </div>
                <div className="plaquet-record">
                  <span className="plaquet-record-label">Month:</span>
                  <span className="plaquet-record-name">{dept.month ? dept.month[0].split(' ')[0] : '—'}</span>
                  <span className="plaquet-record-value">{dept.month ? dept.month[1].monthBest : '0'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* DEPARTMENT PLAQUES */}
        {deptRecords.map((dept) => (
          <div key={`dept-${dept.name}`} className="plaquet">
            <div className="plaquet-content">
              <div className="plaquet-trophy">🏢</div>
              <div className="plaquet-title">{dept.name}</div>
              <div className="plaquet-subtitle">Department Total</div>
              <div className="plaquet-records">
                <div className="plaquet-record">
                  <span className="plaquet-record-label">Day:</span>
                  <span className="plaquet-record-value">{dept.record.dayBest}</span>
                </div>
                <div className="plaquet-record">
                  <span className="plaquet-record-label">Week:</span>
                  <span className="plaquet-record-value">{dept.record.weekBest}</span>
                </div>
                <div className="plaquet-record">
                  <span className="plaquet-record-label">Month:</span>
                  <span className="plaquet-record-value">{dept.record.monthBest}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
