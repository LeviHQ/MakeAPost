import Link from 'next/link';
import Logo from '@/components/Logo';

export const metadata = {
  title: 'MakeAPost Studio — 2-Panel Screenshot & AI Post Editor',
  description: 'Beautify your screenshot client-side and generate tailored social posts for X, LinkedIn, and Reddit.',
};

export default function EditorPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Studio Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: 'var(--border)',
          backgroundColor: 'var(--surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Logo size={34} />
          <span className="badge-brutal badge-yellow" style={{ fontSize: '0.72rem' }}>
            STUDIO MODE
          </span>
        </div>
        <Link href="/" className="btn-brutal" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
          ← Back to Home
        </Link>
      </header>

      {/* Editor Main Shell */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 20px',
        }}
      >
        <div
          className="card-brutal"
          style={{
            maxWidth: '560px',
            width: '100%',
            padding: '36px 30px',
            textAlign: 'center',
          }}
        >
          <div
            className="badge-brutal badge-blue"
            style={{ marginBottom: '16px', display: 'inline-flex' }}
          >
            PHASE 2 READY
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.8rem',
              fontWeight: 800,
              marginBottom: '12px',
            }}
          >
            2-Panel Studio Workspace
          </h1>
          <p
            style={{
              color: 'var(--muted)',
              marginBottom: '24px',
              fontSize: '0.95rem',
              lineHeight: 1.6,
            }}
          >
            Left Panel Canvas Editor &amp; Right Panel Multimodal AI Social Studio are scheduled for Phase 2 implementation.
          </p>
          <Link href="/" className="btn-brutal btn-primary">
            Return to Landing Page →
          </Link>
        </div>
      </main>
    </div>
  );
}
