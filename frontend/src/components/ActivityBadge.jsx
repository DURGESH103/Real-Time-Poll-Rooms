import { Flame, Activity } from 'lucide-react';

const ActivityBadge = ({ isActive, connected }) => {
  if (!connected) return null;

  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300
      ${isActive 
        ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border border-orange-200 animate-pulse-glow' 
        : 'bg-green-50 text-green-700 border border-green-200'
      }
    `}>
      {isActive ? (
        <>
          <Flame className="w-3.5 h-3.5 animate-pulse" />
          <span>People are voting now</span>
        </>
      ) : (
        <>
          <Activity className="w-3.5 h-3.5" />
          <span>Live poll active</span>
        </>
      )}
    </div>
  );
};

export default ActivityBadge;
