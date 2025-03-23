import {
  Button,
  VStack,
  Text,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/modal';
import { Divider } from '@chakra-ui/layout';
import { useToast } from '@chakra-ui/toast';
import { useState } from 'react';
import { ChallengeWithStatus } from '../types/challenge';

interface CompleteChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reflection?: string, moodRating?: number) => Promise<void>;
}

export function CompleteChallengeModal({
  isOpen,
  onClose,
  onSubmit,
}: CompleteChallengeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reflection, setReflection] = useState('');
  const [moodRating, setMoodRating] = useState(5);
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(reflection, moodRating);
      setReflection('');
      setMoodRating(5);
    } catch (error) {
      toast({
        title: 'Error completing challenge',
        description: error instanceof Error ? error.message : 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Complete Challenge</ModalHeader>
        <ModalBody>
          <VStack gap={4} align="stretch">
            <FormControl>
              <FormLabel>How did it go?</FormLabel>
              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Share your thoughts about this challenge..."
                rows={4}
              />
            </FormControl>
            <FormControl>
              <FormLabel>How are you feeling? (1-10)</FormLabel>
              <NumberInput
                value={moodRating}
                onChange={(_, value) => setMoodRating(value)}
                min={1}
                max={10}
                step={1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Complete Challenge
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 