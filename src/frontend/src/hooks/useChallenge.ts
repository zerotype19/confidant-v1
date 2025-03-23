import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../config';
import { CompleteChallengeInput, TodaysChallengeResponse, ChallengeWithStatus } from '../types/challenge';

export function useChallenge(childId: string) {
  const queryClient = useQueryClient();

  // Get today's challenge
  const { data: todaysChallenge, isLoading: isLoadingToday } = useQuery<TodaysChallengeResponse>({
    queryKey: ['todaysChallenge', childId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/challenges/today?child_id=${childId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch today\'s challenge');
      }
      return response.json();
    },
    enabled: !!childId
  });

  // Get all challenges
  const { data: allChallenges, isLoading: isLoadingAll } = useQuery<{ challenges: ChallengeWithStatus[] }>({
    queryKey: ['challenges', childId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/challenges?child_id=${childId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch challenges');
      }
      return response.json();
    },
    enabled: !!childId
  });

  // Complete a challenge
  const { mutateAsync: completeChallenge, isPending: isCompleting } = useMutation<
    TodaysChallengeResponse,
    Error,
    CompleteChallengeInput
  >({
    mutationFn: async (input) => {
      const response = await fetch(`${API_URL}/challenges/${childId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error('Failed to complete challenge');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaysChallenge', childId] });
      queryClient.invalidateQueries({ queryKey: ['challenges', childId] });
    },
  });

  return {
    todaysChallenge: todaysChallenge?.challenge,
    isCompleted: todaysChallenge?.completed ?? false,
    isLoadingToday,
    allChallenges: allChallenges?.challenges ?? [],
    isLoadingAll,
    completeChallenge,
    isCompleting
  };
} 