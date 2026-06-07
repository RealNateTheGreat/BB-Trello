import React from 'react';

const Sparkles: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Sparkle 1 */}
      <div className="absolute top-4 left-8 animate-pulse">
        <div className="w-2 h-2 bg-yellow-300 rounded-full opacity-80"></div>
      </div>
      
      {/* Sparkle 2 */}
      <div className="absolute top-12 right-12 animate-bounce" style={{ animationDelay: '0.5s' }}>
        <div className="w-3 h-3 bg-amber-200 rounded-full opacity-70"></div>
      </div>
      
      {/* Sparkle 3 */}
      <div className="absolute bottom-8 left-16 animate-pulse" style={{ animationDelay: '1s' }}>
        <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-90"></div>
      </div>
      
      {/* Sparkle 4 */}
      <div className="absolute top-6 right-6 animate-bounce" style={{ animationDelay: '1.5s' }}>
        <div className="w-1.5 h-1.5 bg-amber-300 rounded-full opacity-75"></div>
      </div>
      
      {/* Sparkle 5 */}
      <div className="absolute bottom-4 right-20 animate-pulse" style={{ animationDelay: '2s' }}>
        <div className="w-2.5 h-2.5 bg-yellow-200 rounded-full opacity-85"></div>
      </div>
      
      {/* Sparkle 6 */}
      <div className="absolute top-16 left-1/3 animate-bounce" style={{ animationDelay: '0.8s' }}>
        <div className="w-2 h-2 bg-amber-400 rounded-full opacity-60"></div>
      </div>
    </div>
  );
};

export default Sparkles;