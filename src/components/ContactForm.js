'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const TOPIC_OPTIONS = [
  'General Support',
  'Billing & Refund Inquiry',
  'Account & Data Deletion',
  'Bug Report / Feature Request',
];

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('General Support');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: null, text: '' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message, website }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to send your message.');
      }

      setStatus({
        type: 'success',
        text: 'Message sent! We have also emailed a confirmation copy to your inbox.',
      });
      setName('');
      setEmail('');
      setTopic('General Support');
      setMessage('');
    } catch (err) {
      setStatus({
        type: 'error',
        text: err?.message || 'Could not send message. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        marginTop: '14px',
      }}
    >
      {/* Hidden anti-spam honeypot */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ display: 'none' }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            htmlFor="contact-name"
            style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ink)' }}
          >
            Your Name
          </label>
          <input
            id="contact-name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adarsh Mishra"
            className="input-brutal"
            disabled={submitting}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            htmlFor="contact-email"
            style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ink)' }}
          >
            Your Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            maxLength={160}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-brutal"
            disabled={submitting}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label
          htmlFor="contact-topic"
          style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ink)' }}
        >
          Topic
        </label>
        <select
          id="contact-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input-brutal"
          disabled={submitting}
        >
          {TOPIC_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label
          htmlFor="contact-message"
          style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--ink)' }}
        >
          Message
        </label>
        <textarea
          id="contact-message"
          rows={4}
          required
          minLength={10}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us how we can help (include your Google email or payment reference for billing/deletion requests)..."
          className="input-brutal"
          style={{ resize: 'vertical', minHeight: '110px', lineHeight: 1.5 }}
          disabled={submitting}
        />
      </div>

      {status.type && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            border: `2px solid ${status.type === 'success' ? '#16A34A' : '#DC2626'}`,
            backgroundColor:
              status.type === 'success' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.1)',
            color: status.type === 'success' ? '#15803D' : '#DC2626',
            fontSize: '0.84rem',
            fontWeight: 700,
          }}
        >
          {status.type === 'success' ? (
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
          )}
          <span>{status.text}</span>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="btn-brutal btn-primary"
          style={{
            padding: '10px 20px',
            fontSize: '0.9rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            opacity: submitting ? 0.7 : 1,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? (
            <>
              <Loader2
                size={16}
                className="animate-spin"
                style={{ animation: 'spin 0.75s linear infinite' }}
              />
              <span>Sending Message...</span>
            </>
          ) : (
            <>
              <Send size={15} />
              <span>Send Message</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
