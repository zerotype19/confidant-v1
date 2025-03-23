import { Box, Flex, Link, Spacer } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export function DashboardNav() {
  return (
    <Box bg="white" px={4} shadow="sm">
      <Flex h={16} alignItems="center" maxW="container.xl" mx="auto">
        <Link as={RouterLink} to="/dashboard" fontWeight="bold" fontSize="xl">
          Confidant
        </Link>
        <Spacer />
        <Flex gap={4}>
          <Link as={RouterLink} to="/dashboard">Dashboard</Link>
          <Link as={RouterLink} to="/challenges">Challenges</Link>
          <Link as={RouterLink} to="/techniques">Techniques</Link>
          <Link as={RouterLink} to="/profile">Profile</Link>
        </Flex>
      </Flex>
    </Box>
  );
} 