'use client';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => setTime(new Date().toUTCString().slice(17, 25) + ' UTC');
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer style={{
      borderTop: '1px solid var(--line)',
      background: 'var(--navy)',
      padding: '32px 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #0EA5B7, #0B7F97)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 17c2 2 4 2 6 0s4-2 6 0 4 2 6 0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M12 3v9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="2.5" fill="#fff"/>
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink-soft)' }}>
          OCE<span style={{ color: 'var(--teal)' }}>ORIGIN</span>
        </span>
        <span style={{ color: 'var(--ink-faint)', fontSize: '12px', marginLeft: '4px' }}>
          · Marine Oil Spill Intelligence · MAD-PALs · Smart India Hackathon 2026
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '10.5px', color: 'var(--ink-faint)' }}>
          Stack: Python · NumPy · xarray · GeoPandas · Lagrangian Transport
        </span>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '10.5px', color: 'var(--teal)',
          background: 'var(--teal-soft)', padding: '3px 9px', borderRadius: '20px',
          border: '1px solid rgba(14,165,183,0.2)',
        }}>
          {time || '-- UTC'}
        </span>
      </div>
    </footer>
  );
}
