import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--ink)',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <div className="badge-brutal badge-yellow" style={{ marginBottom: '16px', fontSize: '1rem', padding: '6px 14px' }}>
        404 — PAGE NOT FOUND
      </div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px', textTransform: 'uppercase' }}>
        Lost In Orbit
      </h1>
      <p style={{ maxWidth: '420px', color: 'var(--muted)', marginBottom: '24px', fontSize: '1rem' }}>
        The page you are looking for does not exist, has been removed, or is temporarily unavailable.
      </p>
      <Link href="/" className="btn-brutal btn-primary" style={{ padding: '10px 22px', fontSize: '0.92rem' }}>
        Back to Home
      </Link>
    </div>
  );
}
