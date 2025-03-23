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
    async function fetchChildren() {
      try {
        const childrenData = await apiRequest('/children');
        setChildList(childrenData.children);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
        setIsLoading(false);
      }
    }

    fetchChildren();
  }, []);

  // Fetch challenges when child is selected
  useEffect(() => {
    async function fetchChallenges() {
      if (!selectedChild) {
        setChallenges([]);
        setTodaysChallenge(null);
        return;
      }

      try {
        const [challengesData, todaysChallengeData] = await Promise.all([
          apiRequest(`/challenges?child_id=${selectedChild.id}`),
          apiRequest(`/challenges/today?child_id=${selectedChild.id}`)
        ]);

        setChallenges(challengesData.challenges);
        setTodaysChallenge(todaysChallengeData.challenge);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
        setIsLoading(false);
      }
    }

    fetchChallenges();
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

      setChallenges(challengesData.challenges);
      setTodaysChallenge(todaysChallengeData.challenge);
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