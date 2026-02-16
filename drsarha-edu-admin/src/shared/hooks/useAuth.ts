'use client';

import { useState, useEffect } from 'react';
import { decodeJwt } from 'jose';
import { getAuthToken } from '@/shared/utils/auth';

interface TokenPayload {
  userId: string;
  expires: number;
  role: string;
}

export const useAuth = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);

        const token = await getAuthToken();

        if (!token) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        const decodedToken = decodeJwt(token) as TokenPayload;

        if (!decodedToken) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.expires < currentTime) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        console.log(decodedToken);

        setRole(decodedToken.role);
        setUserId(decodedToken.userId);

        setIsAuthorized(true);
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
        setIsAuthorized(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthorized, isLoading, role, userId };
};
