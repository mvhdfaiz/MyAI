
import { useState, useEffect } from 'react';
import firebaseService from '../services/firebaseService';

export const useAuth = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    firebaseService.initializeFirebase()
      .then(uid => setUserId(uid))
      .catch(error => console.error("Auth Hook Error:", error))
      .finally(() => setIsLoading(false));
  }, []);

  return { userId, isLoading };
};
