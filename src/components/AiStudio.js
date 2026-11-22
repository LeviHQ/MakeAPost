'use client';

import { useState } from 'react';
import { compressImageForAI } from '@/lib/imageCompress';

const TONE_OPTIONS = [
  { id: 'Build in Public', label: '🛠️ Build in Public', desc: 'Raw, transparent metrics & learnings' },
  { id: 'Viral Hook', label: '⚡ Viral Hook', desc: 'Punchy curiosity gaps and scroll-stoppers' },
  { id: 'Storytelling', label: '📖 Storytelling', desc: 'Problem-solution narrative journey' },
  { id: 'Tech Breakdown', label: '💻 Tech Breakdown', desc: 'Architecture, stack details & code review' },
];

export default function AiStudio({
  canvasRef,
  image,
  onSwitchToEditor,
}) {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Build in Public');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // In-Memory Generated Posts State (Zero Database Storage)
  const [posts, setPosts] = useState(null);
  const [editedPosts, setEditedPosts] = useState({ x: '', linkedin: '', reddit: '' });
  const [activePlatform, setActivePlatform] = useState('x');
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  // Handle Generation
  const handleGenerate = async () => {
    if (!image || !canvasRef?.current) {
      setErrorMessage('Please paste (Ctrl+V) or drop a screenshot onto the 70% canvas first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Client-side proportional compression (max 768px, 0.65 JPEG)
      const compressed = await compressImageForAI(canvasRef.current);
      setThumbnailUrl(compressed.dataUrl);

      // 2. Call backend /api/generate
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: compressed.base64,
          prompt: prompt.trim(),
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate social posts from screenshot.');
      }

      setPosts(data.posts);
      setEditedPosts({
        x: data.posts.x_post || '',
        linkedin: data.posts.linkedin_post || '',
        reddit: data.posts.reddit_post || '',
      });
    } catch (err) {
      console.error('Generation error:', err);
      setErrorMessage(err.message || 'Network error while generating posts.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Copy Post
  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Current Post for active platform
  const currentPostText = editedPosts[activePlatform] || '';
  const xCharCount = editedPosts.x.length;
  const isXOverLimit = xCharCount > 280;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Header Information */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '1.2rem' }}>✨</span>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            AI Post Generator
          </span>
        </div>
        <span className="badge-brutal badge-blue" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
          Multimodal
        </span>
      </div>

      {/* 2. No Image Warning Alert if Canvas is empty */}
      {!image && (
        <div
          className="card-brutal"
          style={{
            padding: '16px',
            backgroundColor: 'var(--card-bg-subtle)',
            border: '2px dashed var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.85rem' }}>
            <span>⚠️</span>
            <span>No Screenshot Loaded</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.45 }}>
            Paste (<code>Ctrl+V</code>) or drag an image into the 70% visual canvas on the right to start generating posts.
          </p>
          {onSwitchToEditor && (
            <button
              type="button"
              className="btn-brutal"
              style={{ padding: '6px 12px', fontSize: '0.78rem', alignSelf: 'flex-start', marginTop: '4px' }}
              onClick={onSwitchToEditor}
            >
              ← Go to Canvas
            </button>
          )}
        </div>
      )}

      {/* 3. Tone Selector Chips */}
      <div className="card-brutal" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase' }}>
            1. Select Tone
          </span>
          <span className="tag-mono">{tone}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
          {TONE_OPTIONS.map((t) => {
            const isSelected = tone === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className="btn-brutal"
                style={{
                  padding: '8px 6px',
                  fontSize: '0.75rem',
                  backgroundColor: isSelected ? 'var(--accent-yellow)' : 'var(--card-bg-subtle)',
                  color: isSelected ? '#09090B' : 'var(--ink)',
                  boxShadow: isSelected ? '2px 2px 0px var(--shadow-color)' : 'none',
                  border: '1.5px solid var(--border-color)',
                  whiteSpace: 'normal',
                  textAlign: 'center',
                }}
                onClick={() => setTone(t.id)}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Context Prompt Textarea */}
      <div className="card-brutal" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase' }}>
            2. Extra Context (Optional)
          </span>
          <span className="tag-mono" style={{ fontSize: '0.68rem' }}>AI reads canvas too</span>
        </div>

        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe context (optional — AI also reads your screenshot code, metrics, and annotations)..."
          className="input-brutal"
          style={{
            resize: 'vertical',
            fontSize: '0.82rem',
            lineHeight: 1.45,
            minHeight: '68px',
          }}
        />
      </div>

      {/* 5. Primary Generate Button */}
      <button
        type="button"
        disabled={isLoading || !image}
        className="btn-brutal btn-primary"
        style={{
          padding: '12px 18px',
          fontSize: '0.95rem',
          fontWeight: 800,
          opacity: isLoading || !image ? 0.65 : 1,
          cursor: isLoading || !image ? 'not-allowed' : 'pointer',
          boxShadow: '3px 3px 0px var(--shadow-color)',
        }}
        onClick={handleGenerate}
      >
        {isLoading ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '14px',
                height: '14px',
                border: '2px solid #09090B',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            Analyzing Screenshot &amp; Writing...
          </span>
        ) : (
          <span>✨ Generate Posts (X, LinkedIn, Reddit)</span>
        )}
      </button>

      {/* Error Message */}
      {errorMessage && (
        <div
          className="card-brutal"
          style={{
            padding: '12px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '2px solid #EF4444',
            color: '#EF4444',
            fontSize: '0.8rem',
            lineHeight: 1.4,
          }}
        >
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {/* 6. Realistic Generated Post Preview Showcase */}
      {posts && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
          {/* Platform Switcher Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px',
              padding: '4px',
              backgroundColor: 'var(--card-bg-subtle)',
              border: 'var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '2px 2px 0px var(--shadow-color)',
            }}
          >
            {[
              { id: 'x', label: '𝕏 X', meta: `${xCharCount}c` },
              { id: 'linkedin', label: '💼 LinkedIn', meta: 'Post' },
              { id: 'reddit', label: '👾 Reddit', meta: 'Thread' },
            ].map((p) => {
              const isActive = activePlatform === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  className="btn-brutal"
                  style={{
                    padding: '8px 4px',
                    fontSize: '0.75rem',
                    backgroundColor: isActive ? 'var(--accent-yellow)' : 'transparent',
                    color: isActive ? '#09090B' : 'var(--ink)',
                    boxShadow: isActive ? '2px 2px 0px var(--shadow-color)' : 'none',
                    border: isActive ? '1.5px solid var(--border-color)' : '1.5px solid transparent',
                  }}
                  onClick={() => setActivePlatform(p.id)}
                >
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Realistic Post Feed Card */}
          <div
            className="card-brutal"
            style={{
              padding: '16px',
              backgroundColor: 'var(--surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Platform Meta Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: activePlatform === 'reddit' ? '50%' : '6px',
                    backgroundColor: 'var(--accent-yellow)',
                    border: '1.5px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: '#09090B',
                  }}
                >
                  {activePlatform === 'x' ? '𝕏' : activePlatform === 'linkedin' ? 'in' : 'r/'}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ink)' }}>
                    {activePlatform === 'x'
                      ? 'MakeAPost Creator'
                      : activePlatform === 'linkedin'
                      ? 'Founder & Builder'
                      : 'r/webdev • u/maker'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                    {activePlatform === 'x' ? '@builder • Just now' : activePlatform === 'linkedin' ? '1st • 1h • 🌐' : 'Posted by developer'}
                  </div>
                </div>
              </div>

              {activePlatform === 'x' && (
                <span
                  className="badge-brutal"
                  style={{
                    fontSize: '0.68rem',
                    backgroundColor: isXOverLimit ? '#FEE2E2' : 'var(--card-bg-subtle)',
                    color: isXOverLimit ? '#DC2626' : 'var(--ink)',
                    borderColor: isXOverLimit ? '#DC2626' : 'var(--border-color)',
                  }}
                >
                  {xCharCount}/280 chars
                </span>
              )}
            </div>

            {/* Editable Post Body Textarea */}
            <div>
              <textarea
                rows={activePlatform === 'x' ? 5 : 7}
                value={currentPostText}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditedPosts((prev) => ({ ...prev, [activePlatform]: val }));
                }}
                className="input-brutal"
                style={{
                  fontSize: '0.86rem',
                  lineHeight: 1.55,
                  padding: '10px 12px',
                  width: '100%',
                  resize: 'vertical',
                  fontFamily: 'var(--font-body)',
                }}
              />
            </div>

            {/* Attached Thumbnail Preview from Canvas */}
            {thumbnailUrl && (
              <div
                style={{
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--card-bg-subtle)',
                  padding: '4px',
                }}
              >
                <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', padding: '2px 6px', marginBottom: '2px' }}>
                  ATTACHED VISUAL SCREENSHOT
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl}
                  alt="Attached Post Screenshot"
                  style={{
                    width: '100%',
                    maxHeight: '180px',
                    objectFit: 'contain',
                    borderRadius: '4px',
                    display: 'block',
                  }}
                />
              </div>
            )}

            {/* Post Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
              <button
                type="button"
                className="btn-brutal btn-primary"
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
                onClick={() => handleCopy(currentPostText)}
              >
                {copied ? 'Copied to Clipboard! 📋' : 'Copy Post 📋'}
              </button>

              {activePlatform === 'x' && (
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(currentPostText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-brutal btn-dark"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Post on 𝕏 ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Spin Animation for Loading State */}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
