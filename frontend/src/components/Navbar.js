'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/detect', label: 'SAR Detection' },
  { href: '/transport', label: 'Lagrangian Transport' },
  { href: '/attribute', label: 'Source Attribution' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(8,14,24,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        padding: '0 32px',
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #0EA5B7, #0B7F97)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(14,165,183,0.4)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 17c2 2 4 2 6 0s4-2 6 0 4 2 6 0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M12 3v9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="2.5" fill="#fff"/>
            </svg>
          </div>
          <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            OCE<span style={{ color: 'var(--teal)' }}>ORIGIN</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="nav-desktop">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{
                padding: '7px 14px', borderRadius: '8px',
                fontSize: '13.5px', fontWeight: 600,
                color: active ? 'var(--teal)' : 'var(--ink-soft)',
                background: active ? 'var(--teal-soft)' : 'transparent',
                border: active ? '1px solid rgba(14,165,183,0.25)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { if (!active) { e.target.style.color = 'var(--ink)'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}}
                onMouseLeave={e => { if (!active) { e.target.style.color = 'var(--ink-soft)'; e.target.style.background = 'transparent'; }}}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--teal)',
            background: 'var(--teal-soft)', border: '1px solid rgba(14,165,183,0.3)',
            padding: '4px 10px', borderRadius: '20px', fontWeight: 600,
          }}>
            PROTOTYPE
          </span>
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', padding: '4px' }}
            className="nav-hamburger"
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="16" x2="21" y2="16"/></>
              }
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 999,
          background: 'rgba(8,14,24,0.97)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--line)', padding: '16px 24px 24px',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '12px 16px', borderRadius: '10px',
                fontSize: '15px', fontWeight: 600,
                color: pathname === href ? 'var(--teal)' : 'var(--ink-soft)',
                background: pathname === href ? 'var(--teal-soft)' : 'transparent',
                textDecoration: 'none', display: 'block',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
