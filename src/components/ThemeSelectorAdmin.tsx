export const ThemeSelectorAdmin: React.FC = () => {
  const themes = [
    { id: 'original', label: '✨ Original (No Overlay)' },
    { id: 'christmas', label: '🎄 Christmas' },
    { id: 'halloween', label: '🎃 Halloween' },
    { id: 'newyear', label: '🎆 New Year' },
    { id: 'easter', label: '🐰 Easter' },
  ];

  const handleThemeChange = (themeId: string) => {
    // Remove all theme classes
    themes.forEach(t => {
      document.body.classList.remove(`theme-${t.id}`);
    });

    // Add selected theme class
    if (themeId !== 'original') {
      document.body.classList.add(`theme-${themeId}`);
    }

    // Save to localStorage
    localStorage.setItem('app_theme', themeId);
    console.log(`✨ Theme changed to: ${themeId}`);
  };

  const currentTheme = localStorage.getItem('app_theme') || 'original';

  return (
    <div style={{ padding: '1.5rem', background: '#2a2a2a', borderRadius: '8px' }}>
      <label style={{ 
        display: 'block',
        marginBottom: '0.75rem',
        color: '#fff',
        fontWeight: '600',
        fontSize: '1rem'
      }}>
        Select Theme Overlay:
      </label>
      <select
        value={currentTheme}
        onChange={(e) => handleThemeChange(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '6px',
          border: '2px solid #ff6b35',
          background: '#1a1a1a',
          color: '#fff',
          fontSize: '1rem',
          cursor: 'pointer',
          fontWeight: '500'
        }}
      >
        {themes.map(theme => (
          <option key={theme.id} value={theme.id}>
            {theme.label}
          </option>
        ))}
      </select>
      <p style={{
        marginTop: '0.75rem',
        fontSize: '0.9rem',
        color: '#aaa'
      }}>
        Apply festive overlays to Min Side & Chat! 🎉
      </p>
    </div>
  );
};
