import { Box, Flex, Link, Text, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Challenges', path: '/challenges' },
  { label: 'Techniques', path: '/techniques' },
  { label: 'Children', path: '/children' },
  { label: 'Profile', path: '/profile' },
];

export function DashboardNav() {
  const location = useLocation();
  const activeBg = useColorModeValue('primary.50', 'primary.900');
  const activeColor = useColorModeValue('primary.600', 'primary.200');

  return (
    <Box
      as="nav"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg={useColorModeValue('white', 'gray.800')}
      borderBottom="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      px={4}
      py={2}
    >
      <Flex maxW="container.xl" mx="auto" align="center" justify="space-between">
        <Flex gap={8}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              as={RouterLink}
              to={item.path}
              px={3}
              py={2}
              rounded="md"
              color={location.pathname === item.path ? activeColor : 'gray.600'}
              bg={location.pathname === item.path ? activeBg : 'transparent'}
              _hover={{
                bg: activeBg,
                color: activeColor,
              }}
            >
              <Text fontWeight="medium">{item.label}</Text>
            </Link>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
} 