'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from '@/app/page.module.css';

const FAQ_ITEMS = [
  {
    q: 'How does 1-click posting work without connecting my X, LinkedIn, or Reddit account?',
    a: 'MakeAPost never asks for your social passwords or OAuth tokens. When you click "Share", MakeAPost automatically copies your framed high-res PNG to your clipboard and opens the native X, LinkedIn, or Reddit composer with your AI-generated text pre-filled—so you keep 100% manual edit freedom with zero third-party API ban risk.',
  },
  {
    q: 'Do you store my private client messages, emails, or screenshots?',
    a: 'Never. All canvas framing, blurring, and annotations run 100% locally in your browser. When you generate AI copy, only a compressed temporary image is sent transiently in-memory for processing and immediately discarded—zero uploaded screenshots, zero edited images, and zero post drafts are ever stored.',
  },
  {
    q: 'What exact data does MakeAPost save in my account?',
    a: 'Only minimal operational account data stored securely via Supabase: your Google OAuth email, display name/avatar, UI theme preference (Light/Dark), default watermark preference, daily usage counter, and future billing status metadata when applicable.',
  },
  {
    q: 'How do I sign in?',
    a: 'Sign in with one click using Google OAuth (powered by Supabase Auth). The browser-based image editor works instantly without an account, and signing in with Google unlocks AI post generation and cross-device preference sync.',
  },
  {
    q: 'Which social platforms are supported?',
    a: 'X (Twitter), LinkedIn, and Reddit are all live right now. Every generation crafts native hooks and platform-appropriate formatting for each network simultaneously.',
  },
];

export default function LandingFaq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className={styles.faqList}>
      {FAQ_ITEMS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={item.q} className={styles.faqItem}>
            <button
              type="button"
              className={styles.faqTrigger}
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? -1 : idx)}
            >
              <span>{item.q}</span>
              <ChevronDown
                size={18}
                className={`${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ''}`}
              />
            </button>
            {isOpen && <div className={styles.faqAnswer}>{item.a}</div>}
          </div>
        );
      })}
    </div>
  );
}
