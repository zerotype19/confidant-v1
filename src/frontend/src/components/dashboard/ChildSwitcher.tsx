import { useState } from 'react';
import { Child } from '../../types/child';

interface ChildSwitcherProps {
  children: Child[];
  selectedChildId: string | null;
  onChildSelect: (childId: string) => void;
}

export function ChildSwitcher({ children, selectedChildId, onChildSelect }: ChildSwitcherProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectedChild = children.find(child => child.id === selectedChildId);

  return (
    <div className="relative">
      <div className="flex items-center space-x-4">
        {/* Avatar/Emoji */}
        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-2xl">👶</span>
        </div>
        
        {/* Name and Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 text-lg font-medium text-gray-900 hover:text-primary-600"
          >
            <span>{selectedChild?.name || 'Select Child'}</span>
            <svg
              className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => {
                      onChildSelect(child.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      child.id === selectedChildId
                        ? 'bg-primary-50 text-primary-900'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    role="menuitem"
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 