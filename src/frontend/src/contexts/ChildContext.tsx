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

  // Fetch children list
  useEffect(() => {
    let isMounted = true;

    async function fetchChildren() {
      console.log('ChildContext: Starting to fetch children...');
      console.log('ChildContext: API URL:', import.meta.env.VITE_API_URL);
      try {
        console.log('ChildContext: Making request to /children');
        const response = await apiRequest('/children');
        console.log('ChildContext: Children response:', response);
        if (isMounted) {
          // Extract children from the results array
          const children = response.results || [];
          setChildList(children);
          console.log('ChildContext: Updated childList with:', children);
          
          // Auto-select child if there's only one
          if (children.length === 1 && !selectedChild) {
            console.log('ChildContext: Auto-selecting single child:', children[0]);
            setSelectedChild(children[0]);
          }
        }
      } catch (err) {
        console.error('ChildContext: Error fetching children:', err);
        console.error('ChildContext: Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        });
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('An error occurred'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log('ChildContext: Finished loading children');
        }
      }
    }

    fetchChildren();

    return () => {
      isMounted = false;
      console.log('ChildContext: Cleanup - unmounted');
    };
  }, []);

  // Fetch challenges when child is selected
  useEffect(() => {
    let isMounted = true;

    async function fetchChallenges() {
      if (!selectedChild) {
        console.log('No child selected, skipping challenge fetch');
        if (isMounted) {
          setChallenges([]);
          setTodaysChallenge(null);
        }
        return;
      }

      console.log('Fetching challenges for child:', selectedChild.id);
      try {
        const [challengesData, todaysChallengeData] = await Promise.all([
          apiRequest(`/challenges?child_id=${selectedChild.id}`),
          apiRequest(`/challenges/today?child_id=${selectedChild.id}`)
        ]);
        console.log('Challenges response:', challengesData);
        console.log('Today\'s challenge response:', todaysChallengeData);

        if (isMounted) {
          // Handle the nested challenge structure
          const todayChallenge = todaysChallengeData.challenge ? {
            ...todaysChallengeData.challenge,
            completed: todaysChallengeData.completed
          } : null;
          
          setChallenges(challengesData.results || []);
          setTodaysChallenge(todayChallenge);
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

      setChallenges(challengesData);
      setTodaysChallenge(todaysChallengeData);
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