import {
  Box,
  Button,
  Text,
  VStack,
  Heading,
  Badge,
} from '@chakra-ui/react';
import { ChallengeWithStatus } from '../types/challenge';

interface ChallengeCardProps {
  challenge: ChallengeWithStatus;
  onComplete: () => void;
}

export function ChallengeCard({ challenge, onComplete }: ChallengeCardProps) {
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
          onClick={onComplete}
          size="lg"
        >
          Complete Challenge
        </Button>
      </VStack>
    </Box>
  );
} 