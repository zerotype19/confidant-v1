import { useState, ChangeEvent } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  IconButton,
  Textarea,
  Separator,
} from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/modal';
import { createStandaloneToast } from '@chakra-ui/toast';
import { FaSmile, FaMeh, FaFrown, FaCheck } from 'react-icons/fa';
import { ChallengeWithStatus } from '../types/challenge';

const { toast } = createStandaloneToast();

interface CompleteChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: ChallengeWithStatus;
  onComplete: (reflection?: string, moodRating?: number) => void;
}

const MoodRating = {
  HAPPY: 5,
  NEUTRAL: 3,
  SAD: 1
} as const;

export function CompleteChallengeModal({
  isOpen,
  onClose,
  challenge,
  onComplete,
}: CompleteChallengeModalProps) {
  const [reflection, setReflection] = useState('');
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    if (!moodRating) {
      toast({
        title: 'Please select a mood',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setIsCompleting(true);
    try {
      await onComplete(reflection, moodRating);
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to complete challenge',
        description: error instanceof Error ? error.message : 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Complete Challenge</ModalHeader>
        <ModalBody>
          <VStack gap={4}>
            <Text>How did this challenge make you feel?</Text>
            <HStack gap={4}>
              <IconButton
                aria-label="Happy"
                onClick={() => setMoodRating(MoodRating.HAPPY)}
                colorScheme={moodRating === MoodRating.HAPPY ? 'green' : 'gray'}
              >
                <FaSmile />
              </IconButton>
              <IconButton
                aria-label="Neutral"
                onClick={() => setMoodRating(MoodRating.NEUTRAL)}
                colorScheme={moodRating === MoodRating.NEUTRAL ? 'yellow' : 'gray'}
              >
                <FaMeh />
              </IconButton>
              <IconButton
                aria-label="Sad"
                onClick={() => setMoodRating(MoodRating.SAD)}
                colorScheme={moodRating === MoodRating.SAD ? 'red' : 'gray'}
              >
                <FaFrown />
              </IconButton>
            </HStack>
            <Separator />
            <Text>Share your thoughts about this challenge (optional):</Text>
            <Textarea
              value={reflection}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReflection(e.target.value)}
              placeholder="What did you learn? How did it help?"
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleComplete}
            loading={isCompleting}
          >
            Complete <Box as={FaCheck} ml={2} />
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 