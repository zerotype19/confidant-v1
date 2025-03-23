import { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Child } from '../../types/child';

interface ChildSwitcherProps {
  children: Child[];
  selectedChildId: string | null;
  onChildSelect: (childId: string) => void;
}

export function ChildSwitcher({ children = [], selectedChildId, onChildSelect }: ChildSwitcherProps) {
  const selectedChild = Array.isArray(children) ? children.find(child => child.id === selectedChildId) : null;

  return (
    <Box>
      <HStack spacing={4}>
        {/* Avatar/Emoji */}
        <Box
          w="48px"
          h="48px"
          borderRadius="full"
          bg="primary.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="2xl">👶</Text>
        </Box>
        
        {/* Name and Dropdown */}
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            variant="ghost"
            size="lg"
            fontWeight="medium"
            color="gray.900"
            _hover={{ color: 'primary.600' }}
          >
            {selectedChild?.name || 'Select Child'}
          </MenuButton>
          <MenuList>
            {Array.isArray(children) && children.map((child) => (
              <MenuItem
                key={child.id}
                onClick={() => onChildSelect(child.id)}
                bg={child.id === selectedChildId ? 'primary.50' : 'transparent'}
                color={child.id === selectedChildId ? 'primary.900' : 'gray.700'}
                _hover={{ bg: 'gray.50' }}
              >
                {child.name}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </HStack>
    </Box>
  );
} 