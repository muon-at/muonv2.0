import { useEffect, useState } from 'react';
import { useAuth } from '../lib/authContext';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import '../styles/TeamlederKalender.css';

interface Employee {
  id: string;
  name: string;
  externalName: string;
  department?: string;
}

interface CalendarStatus {
  [dateStr: string]: string;
}

const normalize = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\/\\]/g, '_')
    .toLowerCase()
    .trim();
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case '09-16': return '#22c55e';
    case '09-21': return '#3b82f6';
    case '16-21': return '#ec4899';
    case 'fri': return '#eab308';
    case 'helligdag': return '#ef4444';
    default: return '#e5e7eb';
  }
};

const getStatusHours = (status: string): number => {
  switch (status) {
    case '09-16': return 6;
    case '09-21': return 10;
    case '16-21': return 4;
    case 'fri': return 0;
    case 'helligdag': return 0;
    default: return 0;
  }
};

const HOLIDAYS = [
  '2026-01-01', '2026-04-10', '2026-04-13', '2026-05-01', '2026-05-17',
  '2026-05-21', '2026-05-31', '2026-12-25', '2026-12-26'
];

const isHoliday = (dateStr: string) => HOLIDAYS.includes(dateStr);

export default function TeamlederKalender() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [statuses, setStatuses] = useState<CalendarStatus>({});
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load employees in same department
  useEffect(() => {
    const loadEmployees = async () => {
      if (!user?.department) {
        setLoading(false);
        return;
      }

      try {
        const empsRef = collection(db, 'employees');
        const snapshot = await getDocs(empsRef);
        const teamEmployees: Employee[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.department === user.department && data.id !== user.id) {
            teamEmployees.push({
              id: data.id,
              name: data.name || '',
              externalName: data.externalName || data.name || '',
              department: data.department,
            });
          }
        });

        setEmployees(teamEmployees);
        if (teamEmployees.length > 0) {
          setSelectedEmployee(teamEmployees[0].externalName);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading employees:', error);
        setLoading(false);
      }
    };

    loadEmployees();
  }, [user]);

  // Load calendar statuses for selected employee
  useEffect(() => {
    const loadStatuses = async () => {
      if (!selectedEmployee) return;

      try {
        const normalizedName = normalize(selectedEmployee);
        const docRef = doc(db, 'calendar_statuses', normalizedName);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setStatuses(data.statuses || {});
        } else {
          setStatuses({});
        }
      } catch (error) {
        console.error('Error loading statuses:', error);
        setStatuses({});
      }
    };

    loadStatuses();
  }, [selectedEmployee]);

  // Calculate total hours for the month
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    let hours = 0;

    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const status = statuses[dateStr] || (isHoliday(dateStr) ? 'helligdag' : '');
      hours += getStatusHours(status);
    }

    setTotalHours(hours);
  }, [currentMonth, statuses]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentMonth.toLocaleDateString('no-NO', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="page-content">
        <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
          Laster ansatte...
        </div>
      </div>
    );
  }

  return (
    <div className="teamleder-kalender">
      <h2>Team Kalender</h2>

      {/* CONTROLS */}
      <div className="kalender-controls">
        <div className="control-group">
          <label>Velg ansatt:</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="dropdown"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.externalName}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Velg måned:</label>
          <div className="month-nav">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
              ←
            </button>
            <span>{monthName}</span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
              →
            </button>
          </div>
        </div>

        <div className="total-hours">
          <strong>Total timer: {totalHours}h</strong>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="kalender-container">
        {/* WEEKDAYS */}
        <div className="weekdays">
          <div>Man</div>
          <div>Tir</div>
          <div>Ons</div>
          <div>Tor</div>
          <div>Fre</div>
          <div>Lør</div>
          <div>Søn</div>
        </div>

        {/* DAYS GRID */}
        <div className="days-grid">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="day empty"></div>;
            }

            const dateStr = formatDate(day);
            const status = statuses[dateStr] || (isHoliday(dateStr) ? 'helligdag' : '');
            const color = getStatusColor(status);
            const hours = getStatusHours(status);

            return (
              <div
                key={day}
                className="day"
                style={{ backgroundColor: color }}
                title={`${day} ${status ? ` - ${hours}h` : ''}`}
              >
                <div className="day-number">{day}</div>
                {hours > 0 && <div className="day-hours">{hours}h</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* LEGEND */}
      <div className="kalender-legend">
        <div><span style={{ backgroundColor: '#22c55e' }}></span> 09-16 (6h)</div>
        <div><span style={{ backgroundColor: '#3b82f6' }}></span> 09-21 (10h)</div>
        <div><span style={{ backgroundColor: '#ec4899' }}></span> 16-21 (4h)</div>
        <div><span style={{ backgroundColor: '#eab308' }}></span> Fri (0h)</div>
        <div><span style={{ backgroundColor: '#ef4444' }}></span> Helligdag (0h)</div>
      </div>
    </div>
  );
}
