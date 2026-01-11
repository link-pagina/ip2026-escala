
import React, { useState } from 'react';
import { PlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface AssignmentSelectorProps {
  currentValue: string;
  onSelect: (name: string) => void;
  availableNames: string[];
}

const AssignmentSelector: React.FC<AssignmentSelectorProps> = ({ currentValue, onSelect, availableNames }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(currentValue);

  const handleBlur = () => {
    onSelect(tempName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  if (isEditing) {
    return (
      <div className="relative w-full">
        <input
          autoFocus
          className="w-full px-4 py-2 text-xs font-bold border-2 border-indigo-400 rounded-full focus:outline-none bg-white shadow-sm text-gray-700 uppercase"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          list="person-names"
          placeholder="NOME..."
        />
        <datalist id="person-names">
          {availableNames.map(name => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className={`group flex items-center justify-between w-full px-4 py-2 text-[10px] sm:text-xs font-black border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-200 
        ${currentValue 
          ? 'bg-white border-indigo-200 text-indigo-700 shadow-sm' 
          : 'bg-white border-gray-200 text-[#7c7db1] hover:border-indigo-300'}`}
    >
      <div className="flex items-center space-x-2 overflow-hidden">
        {!currentValue && <PlusIcon className="w-3 h-3 text-indigo-500 stroke-[3px]" />}
        <span className="truncate uppercase tracking-wider">
          {currentValue || 'ESCOLHER NOME...'}
        </span>
      </div>
      <ChevronDownIcon className="w-3 h-3 text-gray-300 group-hover:text-indigo-400" />
    </div>
  );
};

export default AssignmentSelector;
