import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChallengeWithStatus, CompleteChallengeInput } from '../types/challenge';
import { apiRequest } from '../utils/api';

interface Child {
  id: string;
  name: string;
  age: number;
  created_at: string;
  updated_at: string;
}

interface ChildContextType {
  selectedChild: Child | null;
  setSelectedChild: (child: Child | null) => void;
  childList: Child[];
  challenges: ChallengeWithStatus[];
  todaysChallenge: ChallengeWithStatus | null;
  isLoading: boolean;
  error: Error | null;
  completeChallenge: (data: { reflection?: string; moodRating?: number }) => Promise<void>;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

interface ChildProviderProps {
  children: ReactNode;
}

export function ChildProvider({ children }: ChildProviderProps) {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [childList, setChildList] = useState<Child[]>([]);
  const [challenges, setChallenges] = useState<ChallengeWithStatus[]>([]);
  const [todaysChallenge, setTodaysChallenge] = useState<ChallengeWithStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch children list
  useEffect(() => {
    let isMounted = true;

    async function fetchChildren() {
      try {
        const response = await apiRequest('/children');
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch children');
        }
        
        if (isMounted) {
          const children = response.results;
          setChildList(children);
          
          // Auto-select child if there's only one
          if (children.length === 1 && !selectedChild) {
            setSelectedChild(children[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('An error occurred'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchChildren();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch challenges when child is selected
  useEffect(() => {
    let isMounted = true;

    async function fetchChallenges() {
      if (!selectedChild) {
        if (isMounted) {
          setChallenges([]);
          setTodaysChallenge(null);
        }
        return;
      }

      try {
        const [challengesData, todaysChallengeData] = await Promise.all([
          apiRequest(`/challenges?child_id=${selectedChild.id}`),
          apiRequest(`/challenges/today?child_id=${selectedChild.id}`)
        ]);

        if (!challengesData.success) {
          throw new Error(challengesData.error || 'Failed to fetch challenges');
        }

        if (!todaysChallengeData.success) {
          throw new Error(todaysChallengeData.error || 'Failed to fetch today\'s challenge');
        }

        if (isMounted) {
          setChallenges(challengesData.results);
          setTodaysChallenge(todaysChallengeData.results);
        }
      } catch (err) {
        console.error('Error fetching challenges:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('An error occurred'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchChallenges();

    return () => {
      isMounted = false;
    };
  }, [selectedChild]);

  const completeChallenge = async (data: { reflection?: string; moodRating?: number }) => {
    if (!selectedChild || !todaysChallenge) {
      throw new Error('No child or challenge selected');
    }

    try {
      const input: CompleteChallengeInput = {
        child_id: selectedChild.id,
        challenge_id: todaysChallenge.id,
        reflection: data.reflection,
        mood_rating: data.moodRating
      };

      await apiRequest('/challenges/complete', {
        method: 'POST',
        body: input
      });

      // Refetch data to update state
      const [challengesData, todaysChallengeData] = await Promise.all([
        apiRequest(`/challenges?child_id=${selectedChild.id}`),
        apiRequest(`/challenges/today?child_id=${selectedChild.id}`)
      ]);

      setChallenges(challengesData.results);
      setTodaysChallenge(todaysChallengeData.results);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    }
  };

  const value = {
    selectedChild,
    setSelectedChild,
    childList,
    challenges,
    todaysChallenge,
    isLoading,
    error,
    completeChallenge
  };

  return (
    <ChildContext.Provider value={value}>
      {children}
    </ChildContext.Provider>
  );
}

export function useChildContext() {
  const context = useContext(ChildContext);
  if (context === undefined) {
    throw new Error('useChildContext must be used within a ChildProvider');
  }
  return context;
} 