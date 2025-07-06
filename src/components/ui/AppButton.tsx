import React from 'react';

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  gradient?: string; // Optional: override default gradient
  className?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  children,
  icon,
  gradient,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`
        flex items-center justify-center
        px-8 py-3 rounded-lg font-semibold text-white
        transition-all duration-300
        hover:scale-[1.02] hover:shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow
        ${className}
      `}
      style={{
        background: gradient || 'linear-gradient(135deg, #2dd4bf 0%, #0891b2 100%)',
        boxShadow: '0 4px 6px -1px rgba(20, 184, 166, 0.1)'
      }}
      {...props}
    >
      {icon && <span className="mr-2 flex items-center">{icon}</span>}
      {children}
    </button>
  );
}; 