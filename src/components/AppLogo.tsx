
import React from 'react';

const AppLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <div className="bg-brand-blue h-6 w-6 rotate-45"></div>
        <div className="bg-brand-yellow h-6 w-6 -ml-3 rotate-45"></div>
      </div>
      <span className="font-bold text-xl">
        <span className="text-white">Collab</span>
        <span className="text-brand-yellow">Verse</span>
      </span>
    </div>
  );
};

export default AppLogo;
