'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from '@/app/page.module.css';

const FAQ_ITEMS = [
  {
    q: 'How does 1-click posting work without connecting my X or LinkedIn password?',
    a: 'MakeAPost never asks for your social passwords or OAuth tokens. When you click "Post", MakeAPost automatically copies your framed high-res PNG to your clipboard and opens the native X, LinkedIn, or Reddit composer with your AI-generated text pre-filled—so you keep 100% edit control with zero API ban risk.',
  },
  {
    q: 'Are my screenshots or client messages saved on your servers?',
    a: 'Never. All canvas framing, blurring, and annotations run 100% locally in your browser. When you generate AI copy, only a compressed temporary image is processed statelessly and discarded immediately—zero screenshots, zero drafts, and zero post history are ever stored.',
  },
  {
    q: 'What can I create during the 3-day free trial?',
    a: 'You get full access to the Neobrutalist Canvas Editor (unlimited frames, annotations, and HD PNG exports) plus 5 free AI post generations per day across X, LinkedIn, and Reddit—no credit card required to start.',
  },
  {
    q: 'Which platforms are supported?',
    a: 'X (Twitter), LinkedIn, and Reddit are all live right now. Every generation creates platform-tuned hooks and formatting tailored to each network, ready to copy or share in one click.',
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
