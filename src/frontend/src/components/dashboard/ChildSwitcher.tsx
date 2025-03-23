import {
  Box,
  Button,
  Text,
  HStack,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Child } from '../../types/child';
import { Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/menu';

interface ChildSwitcherProps {
  children: Child[];
  selectedChildId: string | null;
  onChildSelect: (childId: string) => void;
}

export function ChildSwitcher({ children = [], selectedChildId, onChildSelect }: ChildSwitcherProps) {
  const selectedChild = Array.isArray(children) ? children.find(child => child.id === selectedChildId) : null;

  return (
    <Box>
      <HStack gap={4}>
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
            variant="ghost"
            size="lg"
            fontWeight="medium"
            color="gray.900"
            _hover={{ color: 'primary.600' }}
          >
            <HStack>
              <Text>{selectedChild?.name || 'Select Child'}</Text>
              <ChevronDownIcon />
            </HStack>
          </MenuButton>
          <MenuList>
            {Array.isArray(children) && children.map((child) => (
              <MenuItem
                key={child.id}
                onClick={() => onChildSelect(child.id)}
                bg={child.id === selectedChildId ? 'primary.50' : 'transparent'}
                color={child.id === selectedChildId ? 'primary.900' : 'gray.700'}
                _hover={{ bg: 'gray.50' }}
                value={child.id}
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