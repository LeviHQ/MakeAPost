'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from '@/app/page.module.css';

const FAQ_ITEMS = [
  {
    q: 'Do you store my private screenshots, client messages, or generated posts?',
    a: 'Never. All canvas framing, blurring, and annotations run 100% locally in your browser. When you generate AI copy, only a compressed temporary image is processed transiently in-memory and immediately discarded—zero screenshots, zero edited graphics, and zero post drafts are ever stored on our servers.',
  },
  {
    q: 'How does the Free Plan work, and what are the daily limits on Pro and Advanced?',
    a: 'Every user is automatically enrolled in our monthly auto-renewing Free Plan upon Google Sign-In—no credit card or setup needed. Free includes 3 image edits/day and 1 AI post per platform/day (X, LinkedIn, Reddit). Pro ($7/mo) unlocks 30 image edits/day and 10 AI posts per platform/day; Advanced ($15/mo) unlocks 50 image edits/day and 15 AI posts per platform/day.',
  },
  {
    q: 'Can I test the Studio and AI Post Mode without spending my daily credits?',
    a: 'Yes! Load either the built-in Code Snippet Sample or SaaS Analytics Sample in the Studio. Sample images use 0 image edit credits and 0 AI post credits—you can test framing, annotations, and AI post previews as many times as you like for free.',
  },
  {
    q: 'How does 1-click posting work without connecting my X, LinkedIn, or Reddit account?',
    a: 'MakeAPost never asks for social media passwords or OAuth tokens. When you click "Post", your framed high-res PNG is automatically copied to your clipboard and the native X, LinkedIn, or Reddit composer opens with your generated text pre-filled—giving you full manual control with zero third-party API ban risk.',
  },
  {
    q: 'Can I hide the MakeAPost watermark or use my own brand handle?',
    a: 'Yes. Free accounts export with the subtle "made with makeapost.site" badge. Pro ($7/mo) unlocks Hide Watermark for clean, unbranded exports. Advanced ($15/mo) unlocks Custom Brand Handle so you can stamp your own @handle or website URL on every exported graphic.',
  },
  {
    q: 'How can I hide API keys, emails, or sensitive metrics in my screenshots?',
    a: 'Use the built-in Blur/Redact tool right inside the 70% Canvas Editor before exporting or generating AI posts. You also get 10+ annotation tools including arrows, boxes, circles, spotlight focus, 2x zoom loupe, step badges, and custom text.',
  },
  {
    q: 'How do billing, upgrades, and refunds/cancellations work?',
    a: 'Subscriptions are billed monthly upfront via Dodo Payments with instant activation. Because you can thoroughly test MakeAPost using the monthly Free Plan and unlimited 0-credit Sample Mode before upgrading, all sales are final—MakeAPost does not support refunds or mid-cycle cancellations (only verified duplicate processor charges may be reviewed via our Contact page).',
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
