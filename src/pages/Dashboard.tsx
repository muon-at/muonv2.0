import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../lib/firebase';
import '../styles/Dashboard.css';

interface Employee {
  id: string;
  name: string;
  email?: string;
  department?: string;
  role?: string;
}

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeesRef = ref(db, 'employees');
        const snapshot = await get(employeesRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const employeeList = Object.entries(data).map(([id, emp]: [string, any]) => ({
            id,
            name: emp.name || 'N/A',
            email: emp.email,
            department: emp.department,
            role: emp.role,
          }));
          setEmployees(employeeList);
        } else {
          setError('Ingen ansatte funnet');
        }
      } catch (err) {
        setError(`Feil ved henting av data: ${err}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) return <div className="dashboard">Laster ansattliste...</div>;
  if (error) return <div className="dashboard error">{error}</div>;

  return (
    <div className="dashboard">
      <h1>📊 Muon Dashboard</h1>
      <div className="employees-grid">
        {employees.length > 0 ? (
          employees.map((emp) => (
            <div key={emp.id} className="employee-card">
              <h3>{emp.name}</h3>
              {emp.department && <p><strong>Avdeling:</strong> {emp.department}</p>}
              {emp.role && <p><strong>Rolle:</strong> {emp.role}</p>}
              {emp.email && <p><strong>Email:</strong> {emp.email}</p>}
            </div>
          ))
        ) : (
          <p>Ingen ansatte å vise</p>
        )}
      </div>
    </div>
  );
}
