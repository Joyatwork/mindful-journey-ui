import React from 'react';
import MeditationContent from '@/components/MeditationContent';

const MeditationDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <MeditationContent
          onBack={() => {
            // In demo mode, just navigate home
            window.location.href = '/';
          }}
          onComplete={() => {
            // No-op for demo; could show a toast if needed
            console.log('Meditation session completed (demo)');
          }}
        />
      </div>
    </div>
  );
};

export default MeditationDemo;
