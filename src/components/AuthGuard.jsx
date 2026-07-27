"use client";
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useRouter, usePathname } from 'next/navigation';
import DashboardLayout from './DashboardLayout';

export default function AuthGuard({ children }) {
  const { isAuthenticated } = useContext(AppContext);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, pathname, router]);

  if (!mounted) {
    return null; // prevent hydration mismatch
  }

  if (!isAuthenticated && pathname !== '/login') {
    return null;
  }

  if (pathname === '/login') {
    return children;
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
