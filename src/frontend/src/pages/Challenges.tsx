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
  Container,
} from '@chakra-ui/react';
import { Select } from 'chakra-react-select';
import { useToast } from '@chakra-ui/toast';
import { ChallengeCard } from '../components/ChallengeCard';
import { useChildContext } from '../contexts/ChildContext';
import SessionGuard from '../components/SessionGuard';
import { DashboardNav } from '../components/dashboard/DashboardNav';
import { ChildSwitcher, Child } from '../components/ChildSwitcher';

export function Challenges() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState({ value: 'all', label: 'All Pillars' });
  const [selectedStatus, setSelectedStatus] = useState({ value: 'all', label: 'All Status' });
  const toast = useToast();

  const { selectedChild, childList, challenges = [], isLoading, error, completeChallenge, setSelectedChild } = useChildContext();

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
    { value: 'active', label: 'Active' },
  ];

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <DashboardNav />
        <Container maxW="container.xl" py={8}>
          <Text>Loading challenges...</Text>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg="gray.50">
        <DashboardNav />
        <Container maxW="container.xl" py={8}>
          <Text color="red.500">Error loading challenges: {error.message}</Text>
        </Container>
      </Box>
    );
  }

  const isAgeInRange = (childAge: number, ageRange: string) => {
    const [min, max] = ageRange.split('-').map(Number);
    return childAge >= min && childAge <= max;
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPillar = selectedPillar.value === 'all' || challenge.pillar_id.toString() === selectedPillar.value;
    const matchesStatus = selectedStatus.value === 'all' || 
      (selectedStatus.value === 'completed' && challenge.status === 'completed') ||
      (selectedStatus.value === 'active' && challenge.status === 'active');
    const matchesAge = !selectedChild || isAgeInRange(selectedChild.age, challenge.age_range);
    return matchesSearch && matchesPillar && matchesStatus && matchesAge;
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
      <Box minH="100vh" bg="gray.50">
        <DashboardNav />
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Box>
              <ChildSwitcher
                selectedChildId={selectedChild?.id || null}
                childList={childList}
                onChildSelect={setSelectedChild}
              />
            </Box>

            <Box>
              <Heading size="lg">Challenges</Heading>
              <Text color="gray.600">Browse and complete challenges to help your child grow</Text>
            </Box>

            {!selectedChild ? (
              <Box textAlign="center" py={8}>
                <Text>Please select a child to view their age-appropriate challenges.</Text>
              </Box>
            ) : (
              <>
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

                {filteredChallenges.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <Text>No challenges found matching your criteria.</Text>
                  </Box>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                    {filteredChallenges.map((challenge) => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        onComplete={handleComplete}
                      />
                    ))}
                  </SimpleGrid>
                )}
              </>
            )}
          </VStack>
        </Container>
      </Box>
    </SessionGuard>
  );
} 