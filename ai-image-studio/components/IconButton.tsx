
import React from 'react';

interface IconButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ onClick, disabled, children, title, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    className={`flex items-center justify-center rounded-lg bg-slate-700/80 p-3 text-sm font-medium text-white transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

export default IconButton;
