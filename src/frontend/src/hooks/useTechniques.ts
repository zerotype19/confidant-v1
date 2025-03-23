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
      console.log('Fetching techniques...');
      try {
        const data = await apiRequest('/techniques');
        console.log('Techniques response:', data);
        if (!Array.isArray(data)) {
          console.error('Invalid techniques response:', data);
          throw new Error('Invalid response format from /techniques endpoint');
        }
        return data;
      } catch (error) {
        console.error('Error fetching techniques:', error);
        throw error;
      }
    },
    retry: 1,
  });

  const completeTechniqueMutation = useMutation({
    mutationFn: async ({ techniqueId, input }: { techniqueId: string; input: CompleteTechniqueInput }) => {
      console.log('Completing technique:', techniqueId, input);
      try {
        const data = await apiRequest(`/techniques/${techniqueId}/complete`, {
          method: 'POST',
          body: JSON.stringify(input),
        });
        console.log('Complete technique response:', data);
        if (!data) {
          console.error('Invalid complete technique response:', data);
          throw new Error('Invalid response from /techniques/complete endpoint');
        }
        return data;
      } catch (error) {
        console.error('Error completing technique:', error);
        throw error;
      }
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