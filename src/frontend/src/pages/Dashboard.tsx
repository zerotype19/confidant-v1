import {
  Box,
  Heading,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Container,
  useDisclosure,
} from '@chakra-ui/react';
import { createStandaloneToast } from '@chakra-ui/toast';
import { useChildContext } from '../contexts/ChildContext';
import { ChallengeCard } from '../components/ChallengeCard';
import { ChildSwitcher } from '../components/dashboard/ChildSwitcher';
import { DashboardNav } from '../components/dashboard/DashboardNav';
import { ChallengeWithStatus } from '../types/challenge';
import { CompleteChallengeModal } from '../components/CompleteChallengeModal';
import { useEffect } from 'react';

const { toast } = createStandaloneToast();

export function Dashboard() {
  const { selectedChild, childList, todaysChallenge, isLoading, error, completeChallenge, setSelectedChild } = useChildContext();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    console.log('Selected Child:', selectedChild);
    console.log('Today\'s Challenge:', todaysChallenge);
  }, [selectedChild, todaysChallenge]);

  if (isLoading) {
    return (
      <>
        <DashboardNav />
        <Container maxW="container.xl" py={8}>
          <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
            <Spinner size="xl" color="primary.600" thickness="4px" />
          </Box>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <DashboardNav />
        <Container maxW="container.xl" py={8}>
          <Alert status="error" variant="subtle" rounded="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Error loading dashboard</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Box>
          </Alert>
        </Container>
      </>
    );
  }

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
      onClose();
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
    <>
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

          {!selectedChild ? (
            <Alert status="info" variant="subtle" rounded="md">
              <AlertIcon />
              <Box>
                <AlertTitle>No Child Selected</AlertTitle>
                <AlertDescription>
                  Please select a child from the dropdown above to view their dashboard and challenges.
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <>
              <Box>
                <Heading size="lg">Welcome back, {selectedChild.name}!</Heading>
                <Text color="gray.600">Here's your challenge for today</Text>
              </Box>

              {todaysChallenge ? (
                <Box>
                  <ChallengeCard
                    challenge={todaysChallenge as ChallengeWithStatus}
                    onComplete={onOpen}
                  />
                </Box>
              ) : (
                <Box textAlign="center" py={8}>
                  <Text>No challenge available for today.</Text>
                </Box>
              )}
            </>
          )}
        </VStack>
      </Container>

      <CompleteChallengeModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleComplete}
      />
    </>
  );
} 