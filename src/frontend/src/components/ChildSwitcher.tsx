import {
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';

interface Child {
  id: string;
  name: string;
  age: number;
  age_range: string;
  avatar?: string;
}

interface ChildSwitcherProps {
  selectedChild: Child | null;
  childList: Child[];
  onChildSelect: (child: Child) => void;
}

export function ChildSwitcher({ selectedChild, childList, onChildSelect }: ChildSwitcherProps) {
  return (
    <FormControl>
      <FormLabel>Select Child</FormLabel>
      <Select
        value={selectedChild?.id || ''}
        onChange={(e) => {
          const child = childList.find(c => c.id === e.target.value);
          if (child) {
            onChildSelect(child);
          }
        }}
      >
        <option value="">Select a child...</option>
        {childList.map((child) => (
          <option key={child.id} value={child.id}>
            {child.name} ({child.age_range})
          </option>
        ))}
      </Select>
    </FormControl>
  );
} 