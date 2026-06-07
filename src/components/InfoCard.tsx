import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  path: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  icon: Icon, 
  title, 
  path
}) => {
  return (
    <Link 
      to={path}
      className="block p-6 rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer shadow-xl border-2"
      style={{ 
        backgroundColor: '#3D2914', 
        borderColor: '#8B6F47'
      }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div 
          className="p-4 rounded-lg group-hover:scale-110 transition-transform duration-200 border"
          style={{ 
            backgroundColor: 'rgba(74, 55, 40, 0.6)',
            borderColor: '#8B6F47'
          }}
        >
          <Icon className="w-8 h-8 text-amber-100" />
        </div>
        <span className="text-amber-100 font-semibold text-lg text-center">{title}</span>
      </div>
    </Link>
  );
};

export default InfoCard;