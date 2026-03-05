import { createContext, useContext, useState, useEffect } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'teamlead' | 'employee';
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: AuthUser['role']) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Load user from localStorage on mount, or auto-login as demo Owner
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('user');
      }
    } else {
      // Auto-login as demo Owner (temporary - remove for production)
      const demoUser: AuthUser = {
        id: 'demo-owner-001',
        name: 'Stian Abrahamsen',
        email: 'stian@muonas.no',
        role: 'owner',
      };
      setUser(demoUser);
      localStorage.setItem('user', JSON.stringify(demoUser));
    }
  }, []);

  const login = (email: string, _password: string, role: AuthUser['role']) => {
    const newUser: AuthUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      role,
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('auth', 'true');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useHasAccess(requiredRole: 'owner' | 'teamlead' | 'employee') {
  const { user } = useAuth();
  if (!user) return false;

  const roleHierarchy: { [key: string]: number } = {
    owner: 3,
    teamlead: 2,
    employee: 1,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}
