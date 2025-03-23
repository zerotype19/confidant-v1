import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CompleteChallengeInput, TodaysChallengeResponse, ChallengeWithStatus } from '../types/challenge';
import { apiRequest } from '../utils/api';

export function useChallenge(childId: string) {
  const queryClient = useQueryClient();

  // Get today's challenge
  const { data: todaysChallenge, isLoading: isLoadingToday } = useQuery<TodaysChallengeResponse>({
    queryKey: ['todaysChallenge', childId],
    queryFn: () => apiRequest(`/challenges/today?child_id=${childId}`),
    enabled: !!childId
  });

  // Get all challenges
  const { data: allChallenges, isLoading: isLoadingAll } = useQuery<{ challenges: ChallengeWithStatus[] }>({
    queryKey: ['challenges', childId],
    queryFn: () => apiRequest(`/challenges?child_id=${childId}`),
    enabled: !!childId
  });

  // Complete challenge mutation
  const completeMutation = useMutation({
    mutationFn: (data: CompleteChallengeInput) => 
      apiRequest(`/challenges/${data.challenge_id}/complete`, {
        method: 'POST',
        body: data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaysChallenge'] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    }
  });

  return {
    todaysChallenge: todaysChallenge?.challenge,
    allChallenges: allChallenges?.challenges || [],
    isLoading: isLoadingToday || isLoadingAll,
    completeChallenge: completeMutation.mutate
  };
} 