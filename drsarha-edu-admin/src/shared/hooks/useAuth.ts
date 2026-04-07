'use client';

import { useState, useEffect } from 'react';

/**
 * Сессия через GET /api/auth/session: кука `token` httpOnly, в браузере не видна.
 * JWT от Convex login: { adminId, role, exp }.
 */
export const useAuth = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        const data = (await res.json()) as {
          authenticated?: boolean;
          role?: string | null;
          userId?: string | null;
        };

        if (data.authenticated && data.role) {
          setIsAuthorized(true);
          setRole(data.role);
          setUserId(data.userId ?? null);
        } else {
          setIsAuthorized(false);
          setRole(null);
          setUserId(null);
        }
      } catch (error) {
        console.error('useAuth: /api/auth/session', error);
        setIsAuthorized(false);
        setRole(null);
        setUserId(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSession();
  }, []);

  return { isAuthorized, isLoading, role, userId };
};
