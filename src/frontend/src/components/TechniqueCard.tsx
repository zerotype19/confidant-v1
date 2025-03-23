import {
  Box,
  VStack,
  Heading,
  Text,
  Badge,
  HStack,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { useState } from 'react';

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

interface TechniqueCardProps {
  technique: Technique;
  onComplete: (reflection?: string, moodRating?: number) => Promise<void>;
}

export function TechniqueCard({ technique, onComplete }: TechniqueCardProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reflection, setReflection] = useState('');
  const [moodRating, setMoodRating] = useState(5);

  const handleComplete = async () => {
    await onComplete(reflection, moodRating);
    onClose();
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={6}
      bg="white"
      shadow="sm"
      _hover={{ shadow: 'md' }}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Heading size="md">{technique.title}</Heading>
          <Badge colorScheme="blue">Age: {technique.age_range}</Badge>
        </HStack>

        <Text color="gray.600">{technique.description}</Text>

        <Accordion allowMultiple>
          <AccordionItem>
            <h3>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Steps
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4}>
              <List spacing={2}>
                {technique.steps.map((step, index) => (
                  <ListItem key={index}>
                    <ListIcon as={Text} color="blue.500">•</ListIcon>
                    {step}
                  </ListItem>
                ))}
              </List>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h3>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Example Dialogue
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4}>
              <Text>{technique.example_dialogue}</Text>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h3>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Common Mistakes to Avoid
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4}>
              <List spacing={2}>
                {technique.common_mistakes.map((mistake, index) => (
                  <ListItem key={index}>
                    <ListIcon as={Text} color="red.500">•</ListIcon>
                    {mistake}
                  </ListItem>
                ))}
              </List>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h3>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Use Cases
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4}>
              <HStack spacing={2} wrap="wrap">
                {technique.use_cases.map((useCase, index) => (
                  <Badge key={index} colorScheme="green">{useCase}</Badge>
                ))}
              </HStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Button colorScheme="blue" onClick={onOpen}>
          Try Technique
        </Button>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Complete Technique</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>How did it go? (Optional)</FormLabel>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Share your experience..."
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
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <Button colorScheme="blue" onClick={handleComplete} width="full">
                Complete Technique
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
} 