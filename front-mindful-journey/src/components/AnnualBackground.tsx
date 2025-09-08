import React from 'react';

/**
 * AnnualBackground
 * Wrapper that applies the unified annual diagnostic background.
 * Now uses the same Unsplash image as the Likert screen for full coherence.
 */
export const AnnualBackground: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => {
  return (
    <div className={"relative min-h-screen w-full overflow-hidden animate-fadeIn " + className}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/visuals/annual/default.jpg')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative z-10 flex flex-col min-h-screen px-6 pt-16 pb-10">
        {children}
      </div>
    </div>
  );
};

export default AnnualBackground;
