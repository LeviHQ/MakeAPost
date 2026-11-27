'use client';

import { useState } from 'react';
import { XIcon, LinkedInIcon, RedditIcon } from '@/components/SocialIcons';
import { copyImageAndOpenComposer } from '@/lib/shareIntent';
import {
  AlertTriangle,
  Download,
  Copy,
  Check,
  X,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react';

export default function StudioExitModal({
  isOpen,
  onClose,
  onConfirmLeave,
  onDownloadPng,
  onCopyPng,
  canvasRef,
  generatedPosts = { x: '', linkedin: '', reddit: '' },
  imageCreditsUsed = 0,
  imageLimit = 3,
  hasExported = false,
}) {
  const [sharingPlatform, setSharingPlatform] = useState(null);

  if (!isOpen) return null;

  const remainingImages = Math.max(0, imageLimit - imageCreditsUsed);
  const availablePosts = [
    { id: 'x', label: 'Post on X', Icon: XIcon, text: generatedPosts?.x || '' },
    { id: 'linkedin', label: 'Post on LinkedIn', Icon: LinkedInIcon, text: generatedPosts?.linkedin || '' },
    { id: 'reddit', label: 'Post on Reddit', Icon: RedditIcon, text: generatedPosts?.reddit || '' },
  ].filter((item) => item.text.trim().length > 0);

  const handleDirectPlatformShare = async (platformId, postText) => {
    if (!canvasRef?.current) return;
    setSharingPlatform(platformId);
    try {
      await copyImageAndOpenComposer(canvasRef.current, platformId, postText.trim());
    } catch (err) {
      console.error('Exit modal share error:', err);
    } finally {
      setSharingPlatform(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="card-brutal"
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: '22px',
          backgroundColor: 'var(--surface)',
          color: 'var(--ink)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div className="badge-brutal badge-yellow" style={{ fontSize: '0.74rem' }}>
            <AlertTriangle size={13} />
            <span>SAVE BEFORE LEAVING STUDIO</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-brutal"
            style={{ padding: '4px 8px' }}
            aria-label="Stay in studio"
          >
            <X size={15} />
          </button>
        </div>

        {/* Credit Remaining Pill */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border)',
            backgroundColor: 'var(--card-bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            fontWeight: 700,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ImageIcon size={14} />
            <span>Daily Image Credits Remaining:</span>
          </span>
          <span className="badge-brutal badge-blue" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
            {remainingImages} / {imageLimit} left
          </span>
        </div>

        <p style={{ fontSize: '0.86rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
          {hasExported
            ? 'Your edited image has been saved/copied! You can safely leave the studio or share your generated posts below.'
            : '1 image editing credit was used for this active canvas. Download or copy your edited image right here before leaving so you do not lose your work.'}
        </p>

        {/* Image Export Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <button
            type="button"
            onClick={onDownloadPng}
            className="btn-brutal btn-primary"
            style={{ padding: '10px 12px', fontSize: '0.84rem' }}
          >
            {hasExported ? <Check size={15} /> : <Download size={15} />}
            <span>{hasExported ? 'Downloaded / Ready' : 'Download HD PNG'}</span>
          </button>

          <button
            type="button"
            onClick={onCopyPng}
            className="btn-brutal"
            style={{ padding: '10px 12px', fontSize: '0.84rem', backgroundColor: 'var(--bg-secondary)' }}
          >
            <Copy size={15} />
            <span>Copy PNG</span>
          </button>
        </div>

        {/* Direct Platform Share Buttons if AI Posts Were Generated */}
        {availablePosts.length > 0 && (
          <div
            style={{
              borderTop: '1.5px dashed var(--border-color)',
              paddingTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>
              Share Your Generated Posts Directly:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availablePosts.map(({ id, label, Icon, text }) => (
                <button
                  key={id}
                  type="button"
                  disabled={sharingPlatform === id}
                  onClick={() => handleDirectPlatformShare(id, text)}
                  className="btn-brutal btn-secondary"
                  style={{ flex: 1, minWidth: '130px', padding: '8px 10px', fontSize: '0.8rem' }}
                >
                  <Icon size={13} />
                  <span>{sharingPlatform === id ? 'Opening...' : label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Leave / Stay Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            paddingTop: '6px',
            borderTop: '1.5px dashed var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn-brutal"
            style={{ padding: '8px 14px', fontSize: '0.82rem', backgroundColor: 'var(--surface)' }}
          >
            Stay in Studio
          </button>

          <button
            type="button"
            onClick={onConfirmLeave}
            className="btn-brutal"
            style={{
              padding: '8px 14px',
              fontSize: '0.82rem',
              backgroundColor: hasExported ? 'var(--accent-green)' : '#FEE2E2',
              color: '#09090B',
              borderColor: '#09090B',
            }}
          >
            <span>{hasExported ? 'Leave Studio' : 'Leave Anyway'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
