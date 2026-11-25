'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { compressImageForAI } from '@/lib/imageCompress';
import { XIcon, LinkedInIcon, RedditIcon } from '@/components/SocialIcons';
import { GoogleIcon } from '@/components/NavbarAuth';
import { createClient } from '@/lib/supabase/client';
import { copyImageAndOpenComposer, downloadPngFallback, isMobileDevice } from '@/lib/shareIntent';
import {
  Sparkles,
  AlertCircle,
  Hammer,
  Rocket,
  Code2,
  Zap,
  BookOpen,
  Lightbulb,
  Copy,
  Check,
  ExternalLink,
  Globe,
  ArrowLeft,
  Lock,
  Download,
  X,
  Loader2,
  Share2,
} from 'lucide-react';

const TONE_OPTIONS = [
  { id: 'Build in Public', label: 'Build in Public', icon: Hammer, desc: 'Transparent metrics, MRR milestones & builder lessons' },
  { id: 'Ship & Launch', label: 'Ship & Launch', icon: Rocket, desc: 'Feature drops, v1.0 releases, repos & project launches' },
  { id: 'Tech Breakdown', label: 'Tech Breakdown', icon: Code2, desc: 'Architecture deep-dive, stack choices & code review' },
  { id: 'Viral Hook', label: 'Viral Hook', icon: Zap, desc: 'Scroll-stopping curiosity gaps & contrarian one-liners' },
  { id: 'Founder Story', label: 'Founder Story', icon: BookOpen, desc: 'Problem-solution narrative & debugging war stories' },
  { id: 'How It Works', label: 'How It Works (ELI5)', icon: Lightbulb, desc: 'Dead-simple explanation of complex technical concepts' },
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
  const [selectedPlatforms, setSelectedPlatforms] = useState(['x']);
  const [generatingPlatform, setGeneratingPlatform] = useState(null);
  const [posts, setPosts] = useState(null);
  const [editedPosts, setEditedPosts] = useState({ x: '', linkedin: '', reddit: '' });
  const [activePlatform, setActivePlatform] = useState('x');
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  // Zero-Cost 1-Click Native Composer Intent & Knowledge Guide Modal State
  const [isSharing, setIsSharing] = useState(false);
  const [guideModalPlatform, setGuideModalPlatform] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  // Close guide modal on Escape key
  useEffect(() => {
    if (!guideModalPlatform) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setGuideModalPlatform(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [guideModalPlatform]);

  // Reset generated posts when image is cleared (e.g. user clicked Reset / New Image)
  useEffect(() => {
    if (!image) {
      setPosts(null);
      setEditedPosts({ x: '', linkedin: '', reddit: '' });
      setSelectedPlatforms(['x']);
      setGeneratingPlatform(null);
      setPrompt('');
      setThumbnailUrl(null);
      setErrorMessage(null);
      setGuideModalPlatform(null);
    }
  }, [image]);

  const handleTogglePlatform = (platformId) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platformId)) {
        if (prev.length === 1) return prev;
        return prev.filter((p) => p !== platformId);
      }
      return [...prev, platformId];
    });
  };

  const handlePlatformChange = (p) => {
    setActivePlatform(p);
  };

  // 1. Opens the Knowledge Guide Modal with appropriate flow steps
  const handleInitiatePost = (platform) => {
    if (!canvasRef?.current) {
      setErrorMessage('Canvas element not available. Please load a screenshot.');
      return;
    }
    const postText = (editedPosts[platform] || currentPostText || '').trim();
    if (!postText) {
      setErrorMessage('Please generate or write post text before sharing.');
      return;
    }
    setGuideModalPlatform(platform);
  };

  // 2. Executes the posting action from within the Knowledge Guide Modal
  const handleExecutePost = async () => {
    if (!guideModalPlatform || !canvasRef?.current) return;
    const platform = guideModalPlatform;
    setIsSharing(true);
    try {
      const canvas = canvasRef.current;
      const postText = (editedPosts[platform] || currentPostText || '').trim();
      await copyImageAndOpenComposer(canvas, platform, postText);
      setGuideModalPlatform(null);
    } catch (err) {
      console.error('Error posting to platform:', err);
      setErrorMessage(`Failed to open ${platform} composer: ${err.message || 'Unknown error'}`);
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

  // Shared Generation Helper (Main Selected Platforms OR Single-Tab On-Demand)
  const generateForPlatforms = async (targetPlatforms, singlePlatformId = null) => {
    if (!user) {
      setErrorMessage('Please sign in with Google to generate social posts.');
      return;
    }

    if (!image || !canvasRef?.current) {
      setErrorMessage('Please paste (Ctrl+V) or drop a screenshot onto the 70% canvas first.');
      return;
    }

    if (singlePlatformId) {
      setGeneratingPlatform(singlePlatformId);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const compressed = await compressImageForAI(canvasRef.current);
      setThumbnailUrl(compressed.dataUrl);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: compressed.base64,
          prompt: prompt.trim(),
          tone,
          platforms: targetPlatforms,
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

      if (singlePlatformId) {
        setPosts((prev) => ({ ...(prev || {}), ...data.posts }));
        setEditedPosts((prev) => ({
          ...prev,
          ...(data.posts.x_post !== undefined ? { x: data.posts.x_post } : {}),
          ...(data.posts.linkedin_post !== undefined ? { linkedin: data.posts.linkedin_post } : {}),
          ...(data.posts.reddit_post !== undefined ? { reddit: data.posts.reddit_post } : {}),
        }));
      } else {
        setPosts(data.posts);
        setEditedPosts({
          x: data.posts.x_post || '',
          linkedin: data.posts.linkedin_post || '',
          reddit: data.posts.reddit_post || '',
        });
        if (!targetPlatforms.includes(activePlatform)) {
          setActivePlatform(targetPlatforms[0]);
        }
      }
    } catch (err) {
      console.error('Generation error:', err);
      setErrorMessage(err.message || 'Network error while generating posts.');
    } finally {
      if (singlePlatformId) {
        setGeneratingPlatform(null);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleGenerate = () => generateForPlatforms(selectedPlatforms);

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
            Tip: Image Editor on the left is 100% free &amp; unlimited without login!
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
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  backgroundColor: isSelected ? 'var(--accent-yellow)' : 'var(--card-bg-subtle)',
                  color: isSelected ? '#09090B' : 'var(--ink)',
                  boxShadow: isSelected ? '2px 2px 0px var(--shadow-color)' : 'none',
                  border: '1.5px solid var(--border-color)',
                  whiteSpace: 'nowrap',
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

        {/* Dynamic Micro-Description for Selected Tone */}
        {(() => {
          const selected = TONE_OPTIONS.find((t) => t.id === tone);
          return selected ? (
            <div
              style={{
                backgroundColor: 'var(--card-bg-subtle)',
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.72rem',
                color: 'var(--ink)',
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Lightbulb size={13} style={{ flexShrink: 0, color: 'var(--ink)' }} />
              <div>
                <strong>{selected.label}:</strong> {selected.desc}
              </div>
            </div>
          ) : null;
        })()}
      </div>

      {/* 4.5. Section 2: Target Platforms Selector (Default: X only for fastest response) */}
      <div className="card-brutal" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase' }}>
            2. Target Platforms
          </span>
          <span className="tag-mono" style={{ fontSize: '0.68rem' }}>
            {selectedPlatforms.length === 1 ? 'Fastest (1 selected)' : `${selectedPlatforms.length} selected`}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {[
            { id: 'x', label: 'X', Icon: XIcon, size: 13 },
            { id: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon, size: 14 },
            { id: 'reddit', label: 'Reddit', Icon: RedditIcon, size: 15 },
          ].map(({ id, label, Icon, size }) => {
            const isSelected = selectedPlatforms.includes(id);
            return (
              <button
                key={id}
                type="button"
                className="btn-brutal"
                onClick={() => handleTogglePlatform(id)}
                style={{
                  padding: '8px 6px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: isSelected ? 'var(--accent-yellow)' : 'var(--card-bg-subtle)',
                  color: isSelected ? '#09090B' : 'var(--ink)',
                  boxShadow: isSelected ? '2px 2px 0px var(--shadow-color)' : 'none',
                  border: isSelected ? '2px solid var(--border-color)' : '1.5px solid var(--border-color)',
                }}
              >
                <Icon size={size} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', lineHeight: 1.35 }}>
          Only selected platforms generate (faster &amp; saves AI tokens). You can generate others anytime below.
        </div>
      </div>

      {/* 5. Section 3: Context Prompt Textarea */}
      <div className="card-brutal" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase' }}>
            3. Extra Context (Optional)
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
              <Loader2
                size={18}
                className="animate-spin"
                style={{
                  display: 'inline-block',
                  animation: 'spin 0.75s linear infinite',
                  color: '#09090B',
                }}
              />
              <span>Analyzing Screenshot &amp; Writing...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>
                {selectedPlatforms.length === 3
                  ? 'Generate Posts (All 3)'
                  : selectedPlatforms.length === 1
                  ? `Generate ${selectedPlatforms[0] === 'x' ? 'X' : selectedPlatforms[0] === 'linkedin' ? 'LinkedIn' : 'Reddit'} Post`
                  : `Generate Posts (${selectedPlatforms
                      .map((p) => (p === 'x' ? 'X' : p === 'linkedin' ? 'LinkedIn' : 'Reddit'))
                      .join(', ')})`}
              </span>
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
            {[
              { id: 'x', label: 'X', Icon: XIcon, size: 13 },
              { id: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon, size: 13 },
              { id: 'reddit', label: 'Reddit', Icon: RedditIcon, size: 13 },
            ].map(({ id, label, Icon, size }) => {
              const isTabActive = activePlatform === id;
              const isReady = Boolean(editedPosts[id]?.trim());
              return (
                <button
                  key={id}
                  type="button"
                  className="btn-brutal"
                  style={{
                    padding: '6px',
                    fontSize: '0.78rem',
                    backgroundColor: isTabActive ? 'var(--accent-yellow)' : 'transparent',
                    color: isTabActive ? '#09090B' : 'var(--ink)',
                    border: isTabActive ? '1.5px solid var(--border-color)' : '1.5px solid transparent',
                    boxShadow: isTabActive ? '1.5px 1.5px 0px var(--shadow-color)' : 'none',
                    gap: '5px',
                    position: 'relative',
                  }}
                  onClick={() => handlePlatformChange(id)}
                >
                  <Icon size={size} />
                  <span>{label}</span>
                  {isReady && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#16A34A',
                        flexShrink: 0,
                      }}
                      title="Post ready"
                    />
                  )}
                </button>
              );
            })}
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
              {activePlatform === 'x' && Boolean(currentPostText.trim()) && (
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

            {!currentPostText.trim() ? (
              /* On-Demand Single-Platform Generate Prompt when user switches to an ungenerated tab */
              <div
                style={{
                  padding: '20px 14px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--card-bg-subtle)',
                  border: '1.5px dashed var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--ink)' }}>
                  No {activePlatform === 'x' ? 'X' : activePlatform === 'linkedin' ? 'LinkedIn' : 'Reddit'} post generated yet
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.45, maxWidth: '280px' }}>
                  Generate a tailored {activePlatform === 'x' ? 'X' : activePlatform === 'linkedin' ? 'LinkedIn' : 'Reddit'} post for this screenshot without regenerating your other posts.
                </div>
                <button
                  type="button"
                  className="btn-brutal btn-primary"
                  disabled={isLoading || Boolean(generatingPlatform) || !image}
                  onClick={() => generateForPlatforms([activePlatform], activePlatform)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '4px',
                    opacity: isLoading || Boolean(generatingPlatform) || !image ? 0.65 : 1,
                  }}
                >
                  {generatingPlatform === activePlatform ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                        style={{ display: 'inline-block', animation: 'spin 0.75s linear infinite' }}
                      />
                      <span>Generating {activePlatform === 'x' ? 'X' : activePlatform === 'linkedin' ? 'LinkedIn' : 'Reddit'} Post...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Generate {activePlatform === 'x' ? 'X' : activePlatform === 'linkedin' ? 'LinkedIn' : 'Reddit'} Post</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <>
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

                {/* Action Buttons: 1-Click Native Intent + Clipboard & Copy Text (Full Width Stack) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  {/* 1. Primary 1-Click Native Composer Intent Button (Full Width) */}
                  {activePlatform === 'x' && (
                    <button
                      type="button"
                      className="btn-brutal btn-primary"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                      disabled={isSharing}
                      onClick={() => handleInitiatePost('x')}
                      title="Open X posting guide and composer"
                    >
                      <XIcon size={14} />
                      <span>Post on X</span>
                      <ExternalLink size={13} style={{ opacity: 0.7 }} />
                    </button>
                  )}

                  {activePlatform === 'linkedin' && (
                    <button
                      type="button"
                      className="btn-brutal btn-primary"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                      disabled={isSharing}
                      onClick={() => handleInitiatePost('linkedin')}
                      title="Open LinkedIn posting guide and composer"
                    >
                      <LinkedInIcon size={15} />
                      <span>Post on LinkedIn</span>
                      <ExternalLink size={13} style={{ opacity: 0.7 }} />
                    </button>
                  )}

                  {activePlatform === 'reddit' && (
                    <button
                      type="button"
                      className="btn-brutal btn-primary"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                      disabled={isSharing}
                      onClick={() => handleInitiatePost('reddit')}
                      title="Open Reddit posting guide and submission composer"
                    >
                      <RedditIcon size={16} />
                      <span>Post on Reddit</span>
                      <ExternalLink size={13} style={{ opacity: 0.7 }} />
                    </button>
                  )}

                  {/* 2. Secondary Full-Width Copy Text Button */}
                  <button
                    type="button"
                    className="btn-brutal"
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      backgroundColor: 'var(--surface)',
                    }}
                    onClick={() => handleCopy(currentPostText)}
                    title="Copy generated post text to clipboard"
                  >
                    {copied ? <Check size={14} style={{ color: '#16A34A' }} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. Responsive Neobrutalist Knowledge Guide Modal */}
      {guideModalPlatform && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSharing) {
              setGuideModalPlatform(null);
            }
          }}
        >
          <div
            className="card-brutal"
            style={{
              maxWidth: '460px',
              width: '100%',
              backgroundColor: 'var(--surface)',
              border: '3px solid var(--ink)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-card-hover, 6px 6px 0 var(--ink))',
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Top Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '2px solid var(--border-color)',
                paddingBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--card-bg-subtle)',
                    border: '2px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {guideModalPlatform === 'x' && <XIcon size={16} />}
                  {guideModalPlatform === 'linkedin' && <LinkedInIcon size={17} />}
                  {guideModalPlatform === 'reddit' && <RedditIcon size={18} />}
                </div>
                <div>
                  <h3
                    id="guide-modal-title"
                    style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--ink)' }}
                  >
                    {isMobile
                      ? `Share to ${guideModalPlatform === 'x' ? 'X (Twitter)' : guideModalPlatform === 'linkedin' ? 'LinkedIn' : 'Reddit'}`
                      : `Posting to ${guideModalPlatform === 'x' ? 'X (Twitter)' : guideModalPlatform === 'linkedin' ? 'LinkedIn' : 'Reddit'}`}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    {isMobile ? 'Direct 1-tap mobile sharing' : 'Easy 2-step publishing flow'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setGuideModalPlatform(null)}
                style={{
                  background: 'none',
                  border: '2px solid var(--border-color)',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ink)',
                }}
                title="Close guide"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {isMobile ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '11px',
                      backgroundColor: 'var(--card-bg-subtle)',
                      border: '2px solid var(--border-color)',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-yellow)',
                        border: '2px solid var(--ink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        flexShrink: 0,
                      }}
                    >
                      1
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ink)' }}>
                        Launch Native Share
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                        Tap the button below to launch your phone&apos;s share sheet with both your post text and screenshot attached.
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '11px',
                      backgroundColor: 'var(--card-bg-subtle)',
                      border: '2px solid var(--border-color)',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-yellow)',
                        border: '2px solid var(--ink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        flexShrink: 0,
                      }}
                    >
                      2
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ink)' }}>
                        Select {guideModalPlatform === 'x' ? 'X' : guideModalPlatform === 'linkedin' ? 'LinkedIn' : 'Reddit'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                        Pick the app from your share options. Your post text is also copied to clipboard — if LinkedIn only attaches the image, just tap <strong>Paste</strong> in the caption box!
                      </div>
                    </div>
                  </div>
                </>
              ) : guideModalPlatform === 'linkedin' ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '11px',
                      backgroundColor: 'var(--card-bg-subtle)',
                      border: '2px solid var(--border-color)',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-yellow)',
                        border: '2px solid var(--ink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        flexShrink: 0,
                      }}
                    >
                      1
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ink)' }}>
                        Pre-filled Post &amp; Auto-Download
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                        LinkedIn will open with your generated post copy pre-filled. Your graphic is simultaneously saved to your downloads.
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '11px',
                      backgroundColor: 'var(--card-bg-subtle)',
                      border: '2px solid var(--border-color)',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-yellow)',
                        border: '2px solid var(--ink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        flexShrink: 0,
                      }}
                    >
                      2
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ink)' }}>
                        Attach Media in LinkedIn
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                        In LinkedIn&apos;s composer, click the <strong>Media (photo) icon</strong> at the bottom and choose the downloaded screenshot to attach it.
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '11px',
                      backgroundColor: 'var(--card-bg-subtle)',
                      border: '2px solid var(--border-color)',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-yellow)',
                        border: '2px solid var(--ink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        flexShrink: 0,
                      }}
                    >
                      1
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ink)' }}>
                        Pre-filled Composer
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                        {guideModalPlatform === 'x' ? 'X' : 'Reddit'} will open in a new tab with your post text already filled in.
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '11px',
                      backgroundColor: 'var(--card-bg-subtle)',
                      border: '2px solid var(--border-color)',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-yellow)',
                        border: '2px solid var(--ink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        flexShrink: 0,
                      }}
                    >
                      2
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ink)' }}>
                        Paste Image (Ctrl + V)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                        Your screenshot is automatically copied to your clipboard. Simply press <strong>Ctrl + V</strong> in the composer to attach it!
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Graphic Preview */}
            {thumbnailUrl && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  backgroundColor: 'var(--card-bg-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px dashed var(--border-color)',
                  fontSize: '0.72rem',
                  color: 'var(--muted)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl}
                  alt="Screenshot thumbnail"
                  style={{ width: '32px', height: '24px', objectFit: 'cover', borderRadius: '3px', border: '1px solid var(--border-color)' }}
                />
                <span>Balanced graphic ready to accompany your post</span>
              </div>
            )}

            {/* Modal Bottom Action Footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <button
                type="button"
                className="btn-brutal btn-primary"
                style={{
                  flex: 1,
                  padding: '11px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                disabled={isSharing}
                onClick={handleExecutePost}
              >
                {isSharing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Opening...</span>
                  </>
                ) : (
                  <>
                    {guideModalPlatform === 'x' && <XIcon size={14} />}
                    {guideModalPlatform === 'linkedin' && <LinkedInIcon size={15} />}
                    {guideModalPlatform === 'reddit' && <RedditIcon size={16} />}
                    <span>
                      {isMobile
                        ? `Share to ${guideModalPlatform === 'x' ? 'X' : guideModalPlatform === 'linkedin' ? 'LinkedIn' : 'Reddit'}`
                        : guideModalPlatform === 'linkedin'
                        ? 'Open LinkedIn & Download Graphic'
                        : `Open ${guideModalPlatform === 'x' ? 'X' : 'Reddit'} & Copy Image`}
                    </span>
                    <ExternalLink size={13} style={{ opacity: 0.7 }} />
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn-brutal"
                style={{
                  padding: '11px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--card-bg-subtle)',
                }}
                onClick={() => setGuideModalPlatform(null)}
                disabled={isSharing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
