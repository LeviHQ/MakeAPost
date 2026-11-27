'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Rocket, ArrowRight } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function LandingHeroCta() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let supabase;
    try {
      supabase = createClient();
    } catch {
      return;
    }

    async function checkAuth() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (isMounted) setIsAuthenticated(Boolean(user));
      } catch {}
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setIsAuthenticated(Boolean(session?.user));
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (isAuthenticated) {
    return (
      <Link href="/editor" className={`btn-brutal btn-primary ${styles.heroBtn}`}>
        <span>Open Studio</span>
        <ArrowRight size={17} />
      </Link>
    );
  }

  return (
    <Link href="/editor" className={`btn-brutal btn-primary ${styles.heroBtn}`}>
      <Rocket size={17} />
      <span>Open Studio Free — No Card Needed</span>
    </Link>
  );
}
