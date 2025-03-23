import {
  Box,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import { createStandaloneToast } from '@chakra-ui/toast';
import { useChildContext } from '../contexts/ChildContext';
import { ChallengeCard } from '../components/ChallengeCard';
import SessionGuard from '../components/SessionGuard';
import { ChallengeWithStatus } from '../types/challenge';

const { toast } = createStandaloneToast();

export function Dashboard() {
  const { selectedChild, todaysChallenge, isLoading, error, completeChallenge } = useChildContext();

  if (isLoading) {
    return (
      <Box p={8}>
        <Text>Loading dashboard...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Text color="red.500">Error loading dashboard: {error.message}</Text>
      </Box>
    );
  }

  if (!selectedChild) {
    return (
      <Box p={8}>
        <Text>Please select a child to view their dashboard.</Text>
      </Box>
    );
  }

  const handleComplete = async (reflection?: string, moodRating?: number) => {
    try {
      await completeChallenge({ reflection, moodRating });
      toast({
        title: 'Challenge completed!',
        description: 'Great job! Keep up the good work.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to complete challenge',
        description: err instanceof Error ? err.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <SessionGuard>
      <Box p={8}>
        <VStack gap={8}>
          <Box>
            <Heading size="lg">Welcome back, {selectedChild.name}!</Heading>
            <Text color="gray.600">Here's your challenge for today</Text>
          </Box>

          {todaysChallenge ? (
            <ChallengeCard
              challenge={todaysChallenge as ChallengeWithStatus}
              onComplete={handleComplete}
            />
          ) : (
            <Box textAlign="center" py={8}>
              <Text>No challenge available for today.</Text>
            </Box>
          )}
        </VStack>
      </Box>
    </SessionGuard>
  );
} 