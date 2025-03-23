import {
  Button,
  VStack,
  Text,
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
import { Challenge } from '../types/challenge';
import { apiRequest } from '../utils/api';

interface CompleteChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  onComplete: () => void;
}

export function CompleteChallengeModal({
  isOpen,
  onClose,
  challenge,
  onComplete,
}: CompleteChallengeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      await apiRequest(`/challenges/${challenge.id}/complete`, {
        method: 'POST',
      });
      toast({
        title: 'Challenge completed!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onComplete();
      onClose();
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
            <Text>Are you sure you want to mark this challenge as complete?</Text>
            <Divider />
            <Text fontWeight="bold">{challenge.title}</Text>
            <Text>{challenge.description}</Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleComplete}
            isLoading={isSubmitting}
          >
            Complete Challenge
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 