import { useState } from 'react';
import {
  Container,
  VStack,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Text,
  Box,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { DashboardNav } from '../components/DashboardNav';
import { ChildSwitcher } from '../components/ChildSwitcher';
import { TechniqueCard } from '../components/TechniqueCard';
import { useChildContext } from '../contexts/ChildContext';
import { useTechniques } from '../hooks/useTechniques';

export function Techniques() {
  const { selectedChild, childList } = useChildContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('');
  const toast = useToast();

  const { data: techniques, isLoading, error, completeTechnique } = useTechniques();

  const filteredTechniques = techniques.filter(technique => {
    const matchesSearch = technique.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technique.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPillar = selectedPillar.value === 'all' || technique.pillar_id.toString() === selectedPillar.value;
    const matchesAge = !selectedChild || isAgeInRange(selectedChild.age, technique.age_range);
    return matchesSearch && matchesPillar && matchesAge;
  });

  const handleCompleteTechnique = async (techniqueId: string, reflection?: string, moodRating?: number) => {
    try {
      await completeTechnique(techniqueId, reflection, moodRating);
      toast({
        title: 'Technique completed',
        description: 'Great job! Keep up the good work!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete technique. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading techniques</Text>;

  return (
    <Box minH="100vh" bg="gray.50">
      <DashboardNav />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading>Techniques</Heading>
          
          <ChildSwitcher
            selectedChild={selectedChild}
            childList={childList}
            onChildSelect={(child) => {
              // Handle child selection
            }}
          />

          {!selectedChild ? (
            <Text>Please select a child to view age-appropriate techniques.</Text>
          ) : (
            <>
              <HStack spacing={4}>
                <Input
                  placeholder="Search techniques..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  maxW="300px"
                />
                <Select
                  placeholder="Filter by Pillar"
                  value={selectedPillar}
                  onChange={(e) => setSelectedPillar(e.target.value)}
                  maxW="200px"
                >
                  <option value="1">Independence & Problem-Solving</option>
                  <option value="2">Growth Mindset & Resilience</option>
                  <option value="3">Social Confidence & Communication</option>
                  <option value="4">Purpose & Strength Discovery</option>
                  <option value="5">Managing Fear & Anxiety</option>
                </Select>
              </HStack>

              {filteredTechniques?.length === 0 ? (
                <Text>No techniques found matching your criteria.</Text>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredTechniques?.map((technique) => (
                    <TechniqueCard
                      key={technique.id}
                      technique={technique}
                      onComplete={(reflection, moodRating) =>
                        handleCompleteTechnique(technique.id, reflection, moodRating)
                      }
                    />
                  ))}
                </SimpleGrid>
              )}
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
} 