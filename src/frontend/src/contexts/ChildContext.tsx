import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChallengeWithStatus, CompleteChallengeInput } from '../types/challenge';
import { apiRequest } from '../utils/api';

interface Child {
  id: string;
  name: string;
  age: number;
  age_range: string;
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

export function useChildContext() {
  const context = useContext(ChildContext);
  if (context === undefined) {
    throw new Error('useChildContext must be used within a ChildProvider');
  }
  return context;
}

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
    const fetchChildren = async () => {
      try {
        const response = await apiRequest('/children');
        const children = response.data.map((child: any) => ({
          ...child,
          age_range: getAgeRange(child.age),
        }));
        setChildList(children);
        if (children.length > 0) {
          setSelectedChild(children[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch children'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      const fetchChallenges = async () => {
        try {
          const response = await apiRequest(`/challenges?child_id=${selectedChild.id}`);
          const challenges = response.data.map((challenge: any) => ({
            ...challenge,
            status: challenge.completed ? 'completed' : 'active',
          }));
          setChallenges(challenges);
          
          // Find today's challenge
          const today = new Date().toISOString().split('T')[0];
          const todaysChallenge = challenges.find((challenge: ChallengeWithStatus) => 
            challenge.created_at.startsWith(today) && challenge.status === 'active'
          );
          setTodaysChallenge(todaysChallenge || null);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to fetch challenges'));
        }
      };

      fetchChallenges();
    }
  }, [selectedChild]);

  const completeChallenge = async (data: { reflection?: string; moodRating?: number }) => {
    if (!selectedChild || !todaysChallenge) return;

    try {
      const input: CompleteChallengeInput = {
        child_id: selectedChild.id,
        challenge_id: todaysChallenge.id,
        reflection: data.reflection,
        mood_rating: data.moodRating,
      };

      await apiRequest('/challenges/complete', {
        method: 'POST',
        body: JSON.stringify(input),
      });

      // Update the challenges list
      setChallenges(prevChallenges =>
        prevChallenges.map(challenge =>
          challenge.id === todaysChallenge.id
            ? { ...challenge, status: 'completed' }
            : challenge
        )
      );

      setTodaysChallenge(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to complete challenge'));
      throw err;
    }
  };

  return (
    <ChildContext.Provider
      value={{
        selectedChild,
        setSelectedChild,
        childList,
        challenges,
        todaysChallenge,
        isLoading,
        error,
        completeChallenge,
      }}
    >
      {children}
    </ChildContext.Provider>
  );
}

function getAgeRange(age: number): string {
  if (age <= 5) return '3-5';
  if (age <= 9) return '6-9';
  return '10-13';
} 