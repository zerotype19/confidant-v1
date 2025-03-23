import { useState } from 'react';
import {
  Container,
  VStack,
  Heading,
  Input,
  InputGroup,
  SimpleGrid,
  Text,
  Box,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { Select } from 'chakra-react-select';
import { DashboardNav } from '../components/DashboardNav';
import { ChildSwitcher } from '../components/ChildSwitcher';
import { TechniqueCard } from '../components/TechniqueCard';
import { useChildContext } from '../contexts/ChildContext';
import { useTechniques } from '../hooks/useTechniques';

export function Techniques() {
  const { selectedChild, childList, setSelectedChild } = useChildContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState({ value: 'all', label: 'All Pillars' });
  const toast = useToast();

  const { data: techniques = [], isLoading, error, completeTechnique } = useTechniques();

  const pillarOptions = [
    { value: 'all', label: 'All Pillars' },
    { value: '1', label: 'Independence & Problem-Solving' },
    { value: '2', label: 'Growth Mindset & Resilience' },
    { value: '3', label: 'Social Confidence & Communication' },
    { value: '4', label: 'Purpose & Strength Discovery' },
    { value: '5', label: 'Managing Fear & Anxiety' },
  ];

  const isAgeInRange = (childAge: number, ageRange: string) => {
    const [min, max] = ageRange.split('-').map(Number);
    return childAge >= min && childAge <= max;
  };

  const filteredTechniques = techniques.filter(technique => {
    const matchesSearch = technique.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technique.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPillar = selectedPillar.value === 'all' || 
      technique.pillar_ids.includes(parseInt(selectedPillar.value));
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
          <Box>
            <ChildSwitcher
              children={childList}
              selectedChildId={selectedChild?.id || null}
              onChildSelect={(childId) => {
                const child = childList.find(c => c.id === childId) || null;
                setSelectedChild(child);
              }}
            />
          </Box>

          <Box>
            <Heading size="lg">Techniques</Heading>
            <Text color="gray.600">Browse and practice techniques to help your child grow</Text>
          </Box>

          {!selectedChild ? (
            <Box textAlign="center" py={8}>
              <Text>Please select a child to view their age-appropriate techniques.</Text>
            </Box>
          ) : (
            <>
              <Box>
                <HStack gap={4}>
                  <InputGroup maxW="300px">
                    <Input
                      placeholder="Search techniques..."
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
                </HStack>
              </Box>

              {filteredTechniques.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text>No techniques found matching your criteria.</Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                  {filteredTechniques.map((technique) => (
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