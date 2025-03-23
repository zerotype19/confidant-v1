import { useState } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Heading,
  Badge,
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
      p={6}
      bg="white"
      rounded="lg"
      shadow="md"
      border="1px"
      borderColor="gray.200"
    >
      <VStack align="stretch" spacing={4}>
        <Box>
          <Heading size="md">{challenge.title}</Heading>
          <Text color="gray.600" mt={1}>
            {challenge.description}
          </Text>
        </Box>

        <Box>
          <Badge colorScheme="primary" mr={2}>
            Age {challenge.age_range}
          </Badge>
          <Badge colorScheme="green">
            Level {challenge.difficulty_level}
          </Badge>
        </Box>

        <Button
          colorScheme="primary"
          onClick={() => onComplete()}
          size="lg"
        >
          Complete Challenge
        </Button>
      </VStack>
    </Box>
  );
} 