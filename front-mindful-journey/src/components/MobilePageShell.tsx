import React from 'react';

interface MobilePageShellProps {
  children: React.ReactNode;
  gradient?: 'default' | 'emerald';
  className?: string;
  innerClassName?: string;
}

// Wrapper centralisé pour reproduire le layout mobile (max-w-md centré) utilisé sur Index.tsx
// Permet d'éviter que chaque page recrée son propre full-screen centré qui casse la cohérence responsive.
const MobilePageShell: React.FC<MobilePageShellProps> = ({
  children,
  gradient = 'default',
  className = '',
  innerClassName = ''
}) => {
  const gradientClasses = gradient === 'emerald'
    ? 'bg-gradient-to-br from-white via-emerald-50 to-teal-50'
    : 'bg-gradient-to-br from-blue-50 via-white to-purple-50';

  return (
    <div className={`min-h-screen ${gradientClasses} ${className}`}>
      <div className={`max-w-md mx-auto min-h-screen bg-white/60 backdrop-blur-sm px-4 py-6 pb-10 ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default MobilePageShell;
