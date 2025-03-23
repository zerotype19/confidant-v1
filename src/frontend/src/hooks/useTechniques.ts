import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';

interface Technique {
  id: string;
  title: string;
  description: string;
  steps: string[];
  example_dialogue: string;
  common_mistakes: string[];
  use_cases: string[];
  pillar_ids: number[];
  age_range: string;
}

interface CompleteTechniqueInput {
  reflection?: string;
  mood_rating?: number;
}

export function useTechniques() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<Technique[]>({
    queryKey: ['techniques'],
    queryFn: async () => {
      const response = await apiRequest('/techniques');
      return response.data;
    },
  });

  const completeTechniqueMutation = useMutation({
    mutationFn: async ({ techniqueId, input }: { techniqueId: string; input: CompleteTechniqueInput }) => {
      const response = await apiRequest(`/techniques/${techniqueId}/complete`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techniques'] });
    },
  });

  const completeTechnique = async (techniqueId: string, reflection?: string, moodRating?: number) => {
    return completeTechniqueMutation.mutateAsync({
      techniqueId,
      input: { reflection, mood_rating: moodRating },
    });
  };

  return {
    data,
    isLoading,
    error,
    completeTechnique,
  };
} 