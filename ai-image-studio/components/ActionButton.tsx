
import React from 'react';

interface ActionButtonProps {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, children, title, disabled }) => (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="flex flex-col items-center justify-center gap-1.5 p-3 text-sm transition-colors duration-200 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {children}
    </button>
);

export default ActionButton;
