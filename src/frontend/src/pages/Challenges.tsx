import { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  InputGroup,
  SimpleGrid,
} from '@chakra-ui/react';
import { Select } from 'chakra-react-select';
import { useToast } from '@chakra-ui/toast';
import { ChallengeCard } from '../components/ChallengeCard';
import { ChallengeWithStatus } from '../types/challenge';
import { useChildContext } from '../contexts/ChildContext';
import SessionGuard from '../components/SessionGuard';

export function Challenges() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState({ value: 'all', label: 'All Pillars' });
  const [selectedStatus, setSelectedStatus] = useState({ value: 'all', label: 'All Status' });
  const toast = useToast();

  const { challenges, isLoading, error, completeChallenge } = useChildContext();

  const pillarOptions = [
    { value: 'all', label: 'All Pillars' },
    { value: '1', label: 'Self-Awareness' },
    { value: '2', label: 'Decision Making' },
    { value: '3', label: 'Social Skills' },
    { value: '4', label: 'Emotional Control' },
    { value: '5', label: 'Resilience' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'incomplete', label: 'Incomplete' },
  ];

  if (isLoading) {
    return (
      <Box p={8}>
        <Text>Loading challenges...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Text color="red.500">Error loading challenges: {error.message}</Text>
      </Box>
    );
  }

  const filteredChallenges = challenges?.filter((challenge: ChallengeWithStatus) => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPillar = selectedPillar.value === 'all' || challenge.pillar_id.toString() === selectedPillar.value;
    const matchesStatus = selectedStatus.value === 'all' ||
      (selectedStatus.value === 'completed' && challenge.completed) ||
      (selectedStatus.value === 'incomplete' && !challenge.completed);
    return matchesSearch && matchesPillar && matchesStatus;
  });

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
        <VStack gap={8} alignItems="stretch">
          <Box>
            <Heading size="lg">Challenges</Heading>
            <Text color="gray.600">Browse and complete challenges to help your child grow</Text>
          </Box>

          <Box>
            <HStack gap={4}>
              <InputGroup maxW="300px">
                <Input
                  placeholder="Search challenges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>

              <Box width="200px">
                <Select
                  value={selectedPillar}
                  onChange={(option) => setSelectedPillar(option || { value: 'all', label: 'All Pillars' })}
                  options={pillarOptions}
                />
              </Box>

              <Box width="200px">
                <Select
                  value={selectedStatus}
                  onChange={(option) => setSelectedStatus(option || { value: 'all', label: 'All Status' })}
                  options={statusOptions}
                />
              </Box>
            </HStack>
          </Box>

          {filteredChallenges?.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text>No challenges found matching your criteria.</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {filteredChallenges?.map((challenge: ChallengeWithStatus) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onComplete={handleComplete}
                />
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Box>
    </SessionGuard>
  );
} 