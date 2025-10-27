import React, { useState } from 'react';

export default function TestThemePage() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'creativity' | 'love' | 'cozy'>('dark');

  const colorMap = {
    'dark': 'rgb(0, 0, 0)',
    'light': 'rgb(255, 255, 255)',
    'creativity': 'rgb(255, 0, 0)',  // RED
    'love': 'rgb(0, 255, 0)',  // GREEN
    'cozy': 'rgb(0, 0, 255)',  // BLUE
  };

  const bgColor = colorMap[theme];

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: bgColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        color: theme === 'light' ? '#000' : '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>
        Theme Test Page
      </h1>

      <p style={{ fontSize: '18px' }}>
        Current theme: <strong>{theme}</strong>
      </p>

      <p style={{ fontSize: '18px' }}>
        Background color: <strong>{bgColor}</strong>
      </p>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button
          onClick={() => setTheme('dark')}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Dark
        </button>

        <button
          onClick={() => setTheme('light')}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#fff',
            color: '#000',
            border: '1px solid #ccc',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Light
        </button>

        <button
          onClick={() => setTheme('creativity')}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: 'rgb(255, 0, 0)',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          RED
        </button>

        <button
          onClick={() => setTheme('love')}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: 'rgb(0, 255, 0)',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          GREEN
        </button>

        <button
          onClick={() => setTheme('cozy')}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: 'rgb(0, 0, 255)',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          BLUE
        </button>
      </div>

      <div style={{ marginTop: '40px', maxWidth: '600px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', opacity: 0.8 }}>
          This test page uses pure inline styles with no Tailwind classes or global CSS.
          If the background colors work here but not in the main app, it indicates
          a CSS conflict in the main layout.
        </p>
      </div>
    </div>
  );
}
