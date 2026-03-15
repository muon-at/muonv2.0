import { useEffect, useState } from 'react';

interface ThemeSelectorProps {
  onThemeChange?: (theme: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeChange }) => {
  const [selectedTheme, setSelectedTheme] = useState('original');

  const themes = [
    { id: 'original', label: '✨ Original', emoji: '' },
    { id: 'christmas', label: '🎄 Juletema', emoji: '❄️' },
    { id: 'halloween', label: '🎃 Halloween', emoji: '👻' },
    { id: 'newyear', label: '🎆 Nyttår', emoji: '🎊' },
    { id: 'easter', label: '🐰 Påske', emoji: '🥚' },
  ];

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('app_theme') || 'original';
    setSelectedTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (themeId: string) => {
    // Remove all theme classes
    themes.forEach(t => {
      document.body.classList.remove(`theme-${t.id}`);
    });

    // Add selected theme class (skip for original)
    if (themeId !== 'original') {
      document.body.classList.add(`theme-${themeId}`);
    }

    // Save to localStorage
    localStorage.setItem('app_theme', themeId);

    console.log(`✨ Theme changed to: ${themeId}`);
  };

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    applyTheme(themeId);
    onThemeChange?.(themeId);
  };

  return (
    <div style={{
      padding: '1rem',
      background: '#2a2a2a',
      borderRadius: '8px',
      marginBottom: '2rem'
    }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '0.5rem',
        color: '#fff',
        fontWeight: '600'
      }}>
        Velg Tema/Overlay:
      </label>
      <select
        value={selectedTheme}
        onChange={(e) => handleThemeChange(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '4px',
          border: '2px solid #ff6b35',
          background: '#1a1a1a',
          color: '#fff',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        {themes.map(theme => (
          <option key={theme.id} value={theme.id}>
            {theme.label} {theme.emoji}
          </option>
        ))}
      </select>
      <p style={{
        marginTop: '0.5rem',
        fontSize: '0.85rem',
        color: '#aaa'
      }}>
        Valg lagres i nettleser. Velg overlay for gøy effekter!
      </p>
    </div>
  );
};
