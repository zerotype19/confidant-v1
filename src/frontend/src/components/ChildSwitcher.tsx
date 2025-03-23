import {
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';

export interface Child {
  id: string;
  name: string;
  age: number;
  age_range: string;
  created_at: string;
  updated_at: string;
  avatar?: string;
}

export interface ChildSwitcherProps {
  selectedChildId: string | null;
  childList: Child[];
  onChildSelect: (childId: string) => void;
}

export function ChildSwitcher({ selectedChildId, childList, onChildSelect }: ChildSwitcherProps) {
  return (
    <FormControl>
      <FormLabel>Select Child</FormLabel>
      <Select
        value={selectedChildId || ''}
        onChange={(e) => onChildSelect(e.target.value)}
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