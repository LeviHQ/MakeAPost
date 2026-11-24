'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { compressImageForAI } from '@/lib/imageCompress';
import { XIcon, LinkedInIcon, RedditIcon } from '@/components/SocialIcons';
import { GoogleIcon } from '@/components/NavbarAuth';
import { createClient } from '@/lib/supabase/client';
import { copyImageAndOpenComposer, downloadPngFallback } from '@/lib/shareIntent';
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
  Download,
  X,
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

  // Zero-Cost 1-Click Native Composer Intent & Clipboard State
  const [isSharing, setIsSharing] = useState(false);
  const [shareToast, setShareToast] = useState(null);

  const handlePlatformChange = (p) => {
    setActivePlatform(p);
    setShareToast(null);
  };

  const handlePostOnPlatform = async (platform) => {
    if (!canvasRef?.current) {
      setShareToast({
        message: 'Canvas element not available. Please load a screenshot.',
        isError: true,
      });
      setTimeout(() => setShareToast(null), 4000);
      return;
    }

    setIsSharing(true);
    const platformLabel =
      platform === 'x' ? 'X (Twitter)' : platform === 'linkedin' ? 'LinkedIn' : 'Reddit';

    try {
      const canvas = canvasRef.current;
      const postText = editedPosts[platform] || currentPostText || '';
      const result = await copyImageAndOpenComposer(canvas, platform, postText);

      if (result.copied) {
        setShareToast({
          platform: platformLabel,
          message: `✅ Image copied to clipboard! Press Ctrl+V (or Paste) inside the ${platformLabel} composer.`,
          dataUrl: result.dataUrl,
          isDownload: false,
          isError: false,
        });
      } else {
        setShareToast({
          platform: platformLabel,
          message: `📥 Image downloaded! Attach the downloaded screenshot inside the ${platformLabel} composer.`,
          dataUrl: result.dataUrl,
          isDownload: true,
          isError: false,
        });
      }
      setTimeout(() => setShareToast(null), 9000);
    } catch (err) {
      console.error('Error posting to platform:', err);
      setShareToast({
        message: `Failed to open ${platformLabel} composer: ${err.message || 'Unknown error'}`,
        isError: true,
      });
      setTimeout(() => setShareToast(null), 5000);
    } finally {
      setIsSharing(false);
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

            {/* Action Buttons: 1-Click Native Intent + Clipboard & Copy Text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* 1. Primary 1-Click Native Composer Intent Button */}
                {activePlatform === 'x' && (
                  <button
                    type="button"
                    className="btn-brutal btn-primary"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      fontSize: '0.84rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    disabled={isSharing}
                    onClick={() => handlePostOnPlatform('x')}
                    title="Copy canvas image to clipboard and open X post composer"
                  >
                    <XIcon size={14} />
                    <span>{isSharing ? 'Copying & Opening...' : '🚀 Post on X'}</span>
                  </button>
                )}

                {activePlatform === 'linkedin' && (
                  <button
                    type="button"
                    className="btn-brutal btn-primary"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      fontSize: '0.84rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    disabled={isSharing}
                    onClick={() => handlePostOnPlatform('linkedin')}
                    title="Copy canvas image to clipboard and open LinkedIn post composer"
                  >
                    <LinkedInIcon size={15} />
                    <span>{isSharing ? 'Copying & Opening...' : '🚀 Post on LinkedIn'}</span>
                  </button>
                )}

                {activePlatform === 'reddit' && (
                  <button
                    type="button"
                    className="btn-brutal btn-primary"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      fontSize: '0.84rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    disabled={isSharing}
                    onClick={() => handlePostOnPlatform('reddit')}
                    title="Copy canvas image to clipboard and open Reddit submission composer"
                  >
                    <RedditIcon size={16} />
                    <span>{isSharing ? 'Copying & Opening...' : '🚀 Post on Reddit'}</span>
                  </button>
                )}

                {/* Secondary Copy Text Button */}
                <button
                  type="button"
                  className="btn-brutal"
                  style={{
                    padding: '10px 16px',
                    fontSize: '0.82rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    backgroundColor: 'var(--surface)',
                  }}
                  onClick={() => handleCopy(currentPostText)}
                  title="Copy generated post text to clipboard"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>

              {/* Neobrutalist Notification Toast Banner */}
              {shareToast && (
                <div
                  style={{
                    marginTop: '4px',
                    padding: '12px 14px',
                    backgroundColor: shareToast.isError ? '#FEE2E2' : 'var(--card-bg-subtle)',
                    border: shareToast.isError ? '2px solid #EF4444' : 'var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: shareToast.isError ? '#B91C1C' : 'var(--ink)',
                        lineHeight: 1.45,
                      }}
                    >
                      {shareToast.isError ? (
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      ) : (
                        <Check size={16} style={{ color: '#16A34A', flexShrink: 0, marginTop: '2px' }} />
                      )}
                      <span>{shareToast.message}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShareToast(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--muted)',
                        padding: '2px',
                        flexShrink: 0,
                      }}
                      aria-label="Dismiss toast"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {shareToast.dataUrl && !shareToast.isError && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        paddingTop: '4px',
                        borderTop: '1px dashed var(--border-color)',
                      }}
                    >
                      <button
                        type="button"
                        className="btn-brutal"
                        style={{ padding: '4px 10px', fontSize: '0.74rem', gap: '5px' }}
                        onClick={() => downloadPngFallback(shareToast.dataUrl)}
                      >
                        <Download size={12} />
                        <span>Download PNG</span>
                      </button>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        (Use if manual file upload is preferred)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
