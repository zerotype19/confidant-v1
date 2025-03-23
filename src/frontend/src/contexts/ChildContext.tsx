import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChallengeWithStatus, CompleteChallengeInput } from '../types/challenge';
import { API_URL } from '../config';
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

  useEffect(() => {
    async function fetchData() {
      try {
        const [childrenData, challengesData, todaysChallengeData] = await Promise.all([
          apiRequest('/children'),
          apiRequest('/challenges'),
          apiRequest('/challenges/today')
        ]);

        setChildList(childrenData.children);
        setChallenges(challengesData.challenges);
        setTodaysChallenge(todaysChallengeData.challenge);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

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

      const response = await fetch(`${API_URL}/api/challenges/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error('Failed to complete challenge');
      }

      // Refetch data to update state
      const [challengesRes, todaysChallengeRes] = await Promise.all([
        fetch(`${API_URL}/api/challenges?child_id=${selectedChild.id}`, {
          credentials: 'include'
        }),
        fetch(`${API_URL}/api/challenges/today?child_id=${selectedChild.id}`, {
          credentials: 'include'
        })
      ]);

      if (!challengesRes.ok || !todaysChallengeRes.ok) {
        throw new Error('Failed to fetch updated data');
      }

      const [challengesData, todaysChallengeData] = await Promise.all([
        challengesRes.json(),
        todaysChallengeRes.json()
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