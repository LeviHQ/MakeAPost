'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { compressImageForAI } from '@/lib/imageCompress';
import { XIcon, LinkedInIcon, RedditIcon } from '@/components/SocialIcons';
import { GoogleIcon } from '@/components/NavbarAuth';
import { createClient } from '@/lib/supabase/client';
import {
  Sparkles,
  AlertCircle,
  Hammer,
  Zap,
  BookOpen,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Globe,
  ArrowLeft,
  Lock,
  Send,
  Loader2,
  Clock,
  Share2,
} from 'lucide-react';

const TONE_OPTIONS = [
  { id: 'Build in Public', label: 'Build in Public', icon: Hammer, desc: 'Raw, transparent metrics & learnings' },
  { id: 'Viral Hook', label: 'Viral Hook', icon: Zap, desc: 'Punchy curiosity gaps and scroll-stoppers' },
  { id: 'Storytelling', label: 'Storytelling', icon: BookOpen, desc: 'Problem-solution narrative journey' },
  { id: 'Tech Breakdown', label: 'Tech Breakdown', icon: Code2, desc: 'Architecture, stack details & code review' },
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

  // Supabase Auth State
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // In-Memory Generated Posts State (Zero Database Storage)
  const [posts, setPosts] = useState(null);
  const [editedPosts, setEditedPosts] = useState({ x: '', linkedin: '', reddit: '' });
  const [activePlatform, setActivePlatform] = useState('x');
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  // Social Connections & Direct 1-Click Publishing State
  const [connections, setConnections] = useState({
    linkedin: { connected: false, username: null },
    x: { connected: false, username: null },
    reddit: { connected: false, comingSoon: true },
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessUrl, setPublishSuccessUrl] = useState(null);
  const [publishError, setPublishError] = useState(null);

  // Fetch social connections status when user logs in
  useEffect(() => {
    let isMounted = true;
    async function fetchConnStatus() {
      try {
        const res = await fetch('/api/connect/status');
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data?.connections) {
            setConnections(data.connections);
          }
        }
      } catch (e) {
        console.warn('Could not fetch social connection status:', e);
      }
    }
    if (user) {
      fetchConnStatus();
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handlePlatformChange = (p) => {
    setActivePlatform(p);
    setPublishSuccessUrl(null);
    setPublishError(null);
  };

  const handleDirectPublish = async (platform) => {
    if (!canvasRef?.current) {
      setPublishError('Canvas is not ready. Please load a screenshot.');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccessUrl(null);

    try {
      const canvas = canvasRef.current;
      const imageBase64 = canvas.toDataURL('image/png');
      const text = editedPosts[platform] || '';

      if (!text.trim()) {
        throw new Error('Post content cannot be empty.');
      }

      const res = await fetch(`/api/publish/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          imageBase64,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to publish to ${platform.toUpperCase()}`);
      }

      setPublishSuccessUrl(data.postUrl);
    } catch (err) {
      console.error(`Direct publish error for ${platform}:`, err);
      setPublishError(
        err.message || 'Error publishing post. Please verify your connection in Settings.'
      );
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let supabase;
    try {
      supabase = createClient();
    } catch (e) {
      console.warn('Supabase client error:', e);
      setCheckingAuth(false);
      return;
    }

    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!isMounted) return;
        setUser(user || null);
      } catch (err) {
        console.warn('Auth check error:', err);
      } finally {
        if (isMounted) setCheckingAuth(false);
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user || null);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/editor`,
        },
      });
    } catch (err) {
      console.error('Google sign in error:', err);
    }
  };

  // Handle Generation
  const handleGenerate = async () => {
    if (!user) {
      setErrorMessage('Please sign in with Google to generate social posts.');
      return;
    }

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

      if (response.status === 401) {
        setUser(null);
        throw new Error('Please sign in with Google to generate social posts.');
      }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} style={{ color: 'var(--accent-yellow)' }} />
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

      {/* 2. Unauthenticated Google Sign-In Card */}
      {!user && !checkingAuth && (
        <div
          className="card-brutal"
          style={{
            padding: '18px 16px',
            backgroundColor: 'var(--surface)',
            border: 'var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 800, fontSize: '0.92rem' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-yellow)' }} />
            <span>Sign In to Generate Posts</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.45 }}>
            Sign in with Google to generate tailored X, LinkedIn, and Reddit posts from your screenshots using Multimodal Gemini AI.
          </p>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="btn-brutal btn-primary"
            style={{ padding: '10px 16px', fontSize: '0.88rem', gap: '8px', alignSelf: 'center' }}
          >
            <GoogleIcon size={16} />
            <span>Continue with Google</span>
          </button>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            Tip: 🎨 Image Editor on the left is 100% free &amp; unlimited without login!
          </div>
        </div>
      )}

      {/* 3. No Image Warning Alert if Canvas is empty */}
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
            <AlertCircle size={16} style={{ color: '#EF4444' }} />
            <span>No Screenshot Loaded</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.45 }}>
            Paste (<code>Ctrl+V</code>) or drag an image into the 70% visual canvas on the right to start generating posts.
          </p>
          {onSwitchToEditor && (
            <button
              type="button"
              className="btn-brutal"
              style={{ padding: '6px 12px', fontSize: '0.78rem', alignSelf: 'flex-start', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={onSwitchToEditor}
            >
              <ArrowLeft size={13} />
              <span>Go to Canvas</span>
            </button>
          )}
        </div>
      )}

      {/* 4. Tone Selector Chips */}
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
            const IconComponent = t.icon;
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onClick={() => setTone(t.id)}
              >
                <IconComponent size={14} style={{ flexShrink: 0 }} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Context Prompt Textarea */}
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

      {/* 6. Primary Generate Button or Auth Action */}
      {!user ? (
        <button
          type="button"
          className="btn-brutal btn-primary"
          style={{
            padding: '12px 18px',
            fontSize: '0.9rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onClick={handleGoogleSignIn}
        >
          <Lock size={15} />
          <span>Sign In with Google to Generate</span>
        </button>
      ) : (
        <button
          type="button"
          disabled={isLoading || !image}
          className="btn-brutal btn-primary"
          style={{
            padding: '12px 18px',
            fontSize: '0.92rem',
            fontWeight: 800,
            opacity: isLoading || !image ? 0.65 : 1,
            cursor: isLoading || !image ? 'not-allowed' : 'pointer',
            boxShadow: '3px 3px 0px var(--shadow-color)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onClick={handleGenerate}
        >
          {isLoading ? (
            <>
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
              <span>Analyzing Screenshot &amp; Writing...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Generate Posts (X, LinkedIn, Reddit)</span>
            </>
          )}
        </button>
      )}

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
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Error:</strong> {errorMessage}
            </div>
          </div>
        </div>
      )}

      {/* 7. Realistic Generated Post Preview Showcase */}
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
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <button
              type="button"
              className="btn-brutal"
              style={{
                padding: '6px',
                fontSize: '0.78rem',
                backgroundColor: activePlatform === 'x' ? 'var(--accent-yellow)' : 'transparent',
                color: activePlatform === 'x' ? '#09090B' : 'var(--ink)',
                border: activePlatform === 'x' ? '1.5px solid var(--border-color)' : '1.5px solid transparent',
                boxShadow: activePlatform === 'x' ? '1.5px 1.5px 0px var(--shadow-color)' : 'none',
                gap: '5px',
              }}
              onClick={() => handlePlatformChange('x')}
            >
              <XIcon size={13} />
              <span>X</span>
            </button>

            <button
              type="button"
              className="btn-brutal"
              style={{
                padding: '6px',
                fontSize: '0.78rem',
                backgroundColor: activePlatform === 'linkedin' ? 'var(--accent-yellow)' : 'transparent',
                color: activePlatform === 'linkedin' ? '#09090B' : 'var(--ink)',
                border: activePlatform === 'linkedin' ? '1.5px solid var(--border-color)' : '1.5px solid transparent',
                boxShadow: activePlatform === 'linkedin' ? '1.5px 1.5px 0px var(--shadow-color)' : 'none',
                gap: '5px',
              }}
              onClick={() => handlePlatformChange('linkedin')}
            >
              <LinkedInIcon size={13} />
              <span>LinkedIn</span>
            </button>

            <button
              type="button"
              className="btn-brutal"
              style={{
                padding: '6px',
                fontSize: '0.78rem',
                backgroundColor: activePlatform === 'reddit' ? 'var(--accent-yellow)' : 'transparent',
                color: activePlatform === 'reddit' ? '#09090B' : 'var(--ink)',
                border: activePlatform === 'reddit' ? '1.5px solid var(--border-color)' : '1.5px solid transparent',
                boxShadow: activePlatform === 'reddit' ? '1.5px 1.5px 0px var(--shadow-color)' : 'none',
                gap: '5px',
              }}
              onClick={() => handlePlatformChange('reddit')}
            >
              <RedditIcon size={13} />
              <span>Reddit</span>
            </button>
          </div>

          {/* Realistic Post Feed Card */}
          <div
            className="card-brutal"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: 'var(--surface)',
            }}
          >
            {/* Feed Author Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                  {activePlatform === 'x' ? (
                    <XIcon size={14} />
                  ) : activePlatform === 'linkedin' ? (
                    <LinkedInIcon size={14} />
                  ) : (
                    <RedditIcon size={16} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>
                    {activePlatform === 'x'
                      ? 'You (@founder)'
                      : activePlatform === 'linkedin'
                      ? 'Your Name'
                      : 'u/builder_dev'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Just now</span>
                    <span>•</span>
                    <Globe size={11} />
                  </div>
                </div>
              </div>

              {/* Character Limit Indicator */}
              {activePlatform === 'x' && (
                <span
                  className="badge-brutal"
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    backgroundColor: isXOverLimit ? '#FEE2E2' : 'var(--card-bg-subtle)',
                    color: isXOverLimit ? '#DC2626' : 'var(--ink)',
                    borderColor: isXOverLimit ? '#DC2626' : 'var(--border-color)',
                  }}
                >
                  <Zap size={10} />
                  <span>{xCharCount}/280 chars</span>
                </span>
              )}
            </div>

            {/* Editable Content Textarea */}
            <textarea
              rows={6}
              value={currentPostText}
              onChange={(e) => {
                const val = e.target.value;
                setEditedPosts((prev) => ({ ...prev, [activePlatform]: val }));
              }}
              className="input-brutal"
              style={{
                width: '100%',
                fontSize: '0.85rem',
                lineHeight: 1.55,
                padding: '10px',
                fontFamily: activePlatform === 'reddit' ? 'var(--font-mono)' : 'var(--font-body)',
                minHeight: '130px',
                resize: 'vertical',
              }}
            />

            {/* Attached Thumbnail Indicator */}
            {thumbnailUrl && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  backgroundColor: 'var(--card-bg-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px dashed var(--border-color)',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--muted)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl}
                  alt="Screenshot preview thumbnail"
                  style={{ width: '32px', height: '24px', objectFit: 'cover', borderRadius: '3px', border: '1px solid var(--border-color)' }}
                />
                <span>Canvas screenshot ready to attach</span>
              </div>
            )}

            {/* Success Banner (Live Post Link) */}
            {publishSuccessUrl && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'rgba(74, 222, 128, 0.15)',
                  border: '2px solid #22C55E',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  boxShadow: '2px 2px 0px var(--shadow-color)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: '#166534',
                  }}
                >
                  <Check size={16} />
                  <span>Published to {activePlatform.toUpperCase()}!</span>
                </div>
                <a
                  href={publishSuccessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-brutal"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#FFFFFF',
                    color: '#09090B',
                  }}
                >
                  <span>View Live Post</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Error Banner */}
            {publishError && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#FEE2E2',
                  border: '2px solid #EF4444',
                  borderRadius: 'var(--radius-xs)',
                  color: '#B91C1C',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{publishError}</span>
              </div>
            )}

            {/* Action Buttons: 1-Click Direct Publish, Copy & Connect Link */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* 1. Direct Publish Button for X */}
                {activePlatform === 'x' && (
                  connections.x.connected ? (
                    <button
                      type="button"
                      className="btn-brutal btn-primary"
                      style={{
                        flex: 1,
                        padding: '9px 14px',
                        fontSize: '0.82rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                      disabled={isPublishing}
                      onClick={() => handleDirectPublish('x')}
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Publishing to X...</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>🚀 Publish Now to X</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href="/settings"
                      className="btn-brutal btn-secondary"
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        fontSize: '0.82rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                      title="Connect your X account in Settings for direct 1-click publishing"
                    >
                      <XIcon size={13} />
                      <span>Connect X in Settings →</span>
                    </Link>
                  )
                )}

                {/* 2. Direct Publish Button for LinkedIn */}
                {activePlatform === 'linkedin' && (
                  connections.linkedin.connected ? (
                    <button
                      type="button"
                      className="btn-brutal btn-primary"
                      style={{
                        flex: 1,
                        padding: '9px 14px',
                        fontSize: '0.82rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                      disabled={isPublishing}
                      onClick={() => handleDirectPublish('linkedin')}
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Publishing to LinkedIn...</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>🚀 Publish Now to LinkedIn</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href="/settings"
                      className="btn-brutal btn-secondary"
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        fontSize: '0.82rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                      title="Connect your LinkedIn account in Settings for direct 1-click publishing"
                    >
                      <LinkedInIcon size={13} />
                      <span>Connect LinkedIn in Settings →</span>
                    </Link>
                  )
                )}

                {/* 3. Reddit Coming Soon Badge */}
                {activePlatform === 'reddit' && (
                  <div
                    className="badge-brutal badge-yellow"
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      fontSize: '0.78rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Clock size={13} />
                    <span>Direct Publish — Coming Soon</span>
                  </div>
                )}

                {/* Universal Copy Post Button */}
                <button
                  type="button"
                  className="btn-brutal"
                  style={{
                    padding: '9px 14px',
                    fontSize: '0.82rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    backgroundColor: 'var(--surface)',
                  }}
                  onClick={() => handleCopy(currentPostText)}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Post'}</span>
                </button>
              </div>

              {/* Optional X fallback intent link if not connected */}
              {activePlatform === 'x' && !connections.x.connected && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <a
                    href={`https://x.com/intent/tweet?text=${encodeURIComponent(currentPostText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--muted)',
                      textDecoration: 'underline',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>Or open fallback Tweet Composer</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
