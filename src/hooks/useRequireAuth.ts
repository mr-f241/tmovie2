import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/hooks/useAuthModal';

export const useRequireAuth = (redirectIfNotAuth = true) => {
  const { user, isLoading } = useAuth();
  const { openLogin } = useAuthModal();

  useEffect(() => {
    if (!isLoading && !user && redirectIfNotAuth) {
      openLogin();
    }
  }, [user, isLoading, redirectIfNotAuth, openLogin]);

  return { user, isLoading, isAuthenticated: !!user };
};
