// components/ui/slider.tsx
'use client';

import React from 'react';

interface SliderProps {
  id: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({ id, min, max, value, onChange, className }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <input
      type="range"
      id={id}
      min={min}
      max={max}
      value={value}
      onChange={handleChange}
      className={`w-full ${className}`}
    />
  );
};
