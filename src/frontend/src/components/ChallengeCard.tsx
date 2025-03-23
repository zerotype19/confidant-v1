import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  useDisclosure,
  CardBody,
  Stack,
} from '@chakra-ui/react';
import { FaArrowRight } from 'react-icons/fa';
import { CompleteChallengeModal } from './CompleteChallengeModal';
import { ChallengeWithStatus } from '../types/challenge';
import { useState } from 'react';

interface ChallengeCardProps {
  challenge: ChallengeWithStatus;
  onComplete: (reflection?: string, moodRating?: number) => void;
}

export function ChallengeCard({ challenge, onComplete }: ChallengeCardProps) {
  const disclosure = useDisclosure({ defaultOpen: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  return (
    <Box>
      <CardBody>
        <Stack gap={4}>
          <HStack gap={4}>
            <Box>
              <VStack alignItems="start" gap={2} flex={1}>
                <Heading size="md">{challenge.title}</Heading>
                <Text color="gray.600">{challenge.description}</Text>
              </VStack>
            </Box>
          </HStack>

          <VStack alignItems="start" gap={4}>
            <Box>
              <VStack alignItems="start" gap={2} width="100%">
                <Text fontWeight="bold">Pillar</Text>
                <Text>{challenge.pillar_id}</Text>
              </VStack>
            </Box>

            <Box>
              <VStack alignItems="start" gap={2} width="100%">
                <Text fontWeight="bold">Goal</Text>
                <Text>{challenge.goal}</Text>
              </VStack>
            </Box>
          </VStack>

          <HStack gap={4} width="100%">
            {!challenge.completed ? (
              <Button
                colorScheme="blue"
                onClick={disclosure.onOpen}
                disabled={isSubmitting}
                flex={1}
              >
                Complete Challenge
                <Icon as={FaArrowRight} ml={2} />
              </Button>
            ) : (
              <Button
                variant="outline"
                colorScheme="blue"
                onClick={disclosure.onOpen}
                flex={1}
              >
                View Details
                <Icon as={FaArrowRight} ml={2} />
              </Button>
            )}
          </HStack>
        </Stack>
      </CardBody>

      <CompleteChallengeModal
        isOpen={disclosure.open}
        onClose={disclosure.onClose}
        challenge={challenge}
        onComplete={onComplete}
      />
    </Box>
  );
} 