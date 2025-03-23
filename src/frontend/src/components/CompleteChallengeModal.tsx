import {
  Button,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';

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
  const [reflection, setReflection] = useState('');
  const [moodRating, setMoodRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(reflection, moodRating);
      setReflection('');
      setMoodRating(5);
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete challenge. Please try again.',
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
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Reflection</FormLabel>
              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="How did this challenge go? What did you learn?"
                rows={4}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Mood Rating (1-10)</FormLabel>
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
            colorScheme="primary"
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