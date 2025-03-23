import { useState } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { CompleteChallengeModal } from './CompleteChallengeModal';
import { ChallengeWithStatus } from '../types/challenge';

interface ChallengeCardProps {
  challenge: ChallengeWithStatus;
  onComplete: (reflection?: string, moodRating?: number) => Promise<void>;
}

export function ChallengeCard({ challenge, onComplete }: ChallengeCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting] = useState(false);

  const handleComplete = async (reflection?: string, moodRating?: number) => {
    if (onComplete) {
      await onComplete(reflection, moodRating);
    }
    setIsOpen(false);
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      bg="white"
      shadow="sm"
    >
      <VStack align="stretch" gap={4}>
        <Box>
          <Text fontSize="lg" fontWeight="semibold">
            {challenge.title}
          </Text>
          <Text color="gray.600">{challenge.description}</Text>
        </Box>

        <HStack gap={2}>
          {challenge.completed ? (
            <>
              <Button
                colorScheme="green"
                disabled={isSubmitting}
                flex={1}
              >
                Completed
              </Button>
              <Button
                variant="outline"
                colorScheme="blue"
                onClick={() => setIsOpen(true)}
                flex={1}
              >
                View Reflection
              </Button>
            </>
          ) : (
            <Button
              colorScheme="blue"
              onClick={() => setIsOpen(true)}
              disabled={isSubmitting}
              flex={1}
            >
              Complete Challenge
            </Button>
          )}
        </HStack>
      </VStack>

      <CompleteChallengeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onComplete={handleComplete}
      />
    </Box>
  );
} 