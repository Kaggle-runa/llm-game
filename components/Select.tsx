// components/Select.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  label: string;
  value: number;
}

interface SelectProps {
  options: SelectOption[];
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string; // クラス名を受け取るプロパティを追加
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '選択してください',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);
  const selectRef = useRef<HTMLDivElement>(null);

  // 外部クリック時にドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // キーボード操作でのドロップダウン制御
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(prev => !prev);
    }
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={selectRef}>
      <div
        tabIndex={0}
        className="flex justify-between items-center p-2 border border-gray-300 rounded-lg bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(prev => !prev)}
        onKeyDown={handleKeyDown}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map(option => (
            <li
              key={option.value}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-100 flex justify-between items-center whitespace-nowrap ${
                option.value === value ? 'bg-blue-100' : ''
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(option.value);
                  setIsOpen(false);
                }
              }}
              tabIndex={0}
            >
              <span className="truncate">{option.label}</span>
              {option.value === value && <Check className="w-4 h-4 text-blue-500" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
