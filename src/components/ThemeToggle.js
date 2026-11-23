'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '', style = {} }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('makeapost-theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('makeapost-theme', nextTheme);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn-brutal ${className}`}
      style={{
        padding: '6px 12px',
        fontSize: '0.82rem',
        gap: '6px',
        cursor: 'pointer',
        userSelect: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        ...style,
      }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle dark/light theme"
    >
      {mounted ? (
        theme === 'dark' ? (
          <>
            <Sun size={15} style={{ color: '#FFD93D', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Light</span>
          </>
        ) : (
          <>
            <Moon size={15} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Dark</span>
          </>
        )
      ) : (
        <span style={{ width: '15px', height: '15px', display: 'inline-block' }} />
      )}
    </button>
  );
}
