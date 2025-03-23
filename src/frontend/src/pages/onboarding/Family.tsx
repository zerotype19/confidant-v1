import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useChildContext } from '../../contexts/ChildContext';
import { apiRequest } from '../../utils/api';

export default function FamilyOnboarding() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { setSelectedChild } = useChildContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest('/children', {
        method: 'POST',
        body: JSON.stringify({
          name,
          age: parseInt(age),
        }),
      });

      if (!response || !response.id) {
        throw new Error('Failed to create child');
      }

      // Set the newly created child as selected
      setSelectedChild(response.id);

      toast({
        title: 'Success',
        description: 'Family member added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add family member',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Welcome to Confidant</Heading>
        <Text>Let's start by adding your first family member.</Text>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Age</FormLabel>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter age"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={isLoading}
            >
              Add Family Member
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
} 