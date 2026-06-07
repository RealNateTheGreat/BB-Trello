import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import NoPreviewImage from './NoPreviewImage';

interface ItemCardProps {
  tier: string;
  itemName: string;
  baseValue: string;
  demand: string;
  status: 'Stable' | 'Unstable' | 'Fluctuating' | 'Underpaid' | 'Overpaid';
  itemImage: string;
  showFreshValue?: boolean;
  showUsedValue?: boolean;
  freshValue?: string;
  usedValue?: string;
}

const ItemCard: React.FC<ItemCardProps> = ({
  tier,
  itemName,
  baseValue,
  demand,
  status,
  itemImage,
  showFreshValue = false,
  showUsedValue = false,
  freshValue,
  usedValue
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedValueType, setSelectedValueType] = useState<'fresh' | 'used'>('fresh');
  const [currentValue, setCurrentValue] = useState(baseValue);
  const [imageError, setImageError] = useState(false);

  const hasDropdown = showFreshValue || showUsedValue;

  const handleValueSelection = (type: 'fresh' | 'used') => {
    setSelectedValueType(type);
    if (type === 'fresh' && freshValue) {
      setCurrentValue(freshValue);
    } else if (type === 'used' && usedValue) {
      setCurrentValue(usedValue);
    }
    setIsDropdownOpen(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Stable':
        return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'Unstable':
        return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'Fluctuating':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'Underpaid':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'Overpaid':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/50';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'mythical':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/50';
      case 'legendary':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'rare':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/50';
      case 'uncommon':
        return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'common':
        return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
      default:
        return 'text-amber-400 bg-amber-500/20 border-amber-500/50';
    }
  };

  // Set default to fresh value if available, otherwise use base value
  React.useEffect(() => {
    if (showFreshValue && freshValue) {
      setCurrentValue(freshValue);
      setSelectedValueType('fresh');
    }
  }, [showFreshValue, freshValue]);

  return (
    <div 
      className="rounded-xl p-6 shadow-xl border-2 hover:scale-105 transition-all duration-300"
      style={{ 
        backgroundColor: '#3D2914', 
        borderColor: '#2D1F0F'
      }}
    >
      {/* Tier Badge */}
      <div className="flex justify-center mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getTierColor(tier)}`}>
          {tier}
        </span>
      </div>

      {/* Item Image */}
      <div className="flex justify-center mb-4">
        {imageError ? (
          <NoPreviewImage className="w-24 h-24" />
        ) : (
          <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-amber-700/50">
            <img 
              src={itemImage} 
              alt={itemName}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
        )}
      </div>

      {/* Item Name */}
      <h3 className="text-xl font-bold text-amber-100 text-center mb-4">{itemName}</h3>

      {/* Main Value */}
      <div className="space-y-3 mb-4">
        <div className="text-center">
          <p className="text-amber-200 text-sm mb-1">Value</p>
          <p className="text-amber-100 text-lg font-semibold">{currentValue}</p>
          {hasDropdown && (
            <div className="relative mt-2">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center space-x-2 mx-auto px-3 py-1 rounded-lg bg-amber-800/30 hover:bg-amber-700/40 transition-colors text-amber-200 text-sm"
              >
                <span>
                  {selectedValueType === 'fresh' ? 'Fresh Value' : 'Used/Upgraded Value'}
                </span>
                {isDropdownOpen ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-amber-900/90 border border-amber-700/50 rounded-lg shadow-xl z-10 min-w-[140px]">
                  {showFreshValue && (
                    <button
                      onClick={() => handleValueSelection('fresh')}
                      className="w-full px-3 py-2 text-left text-amber-200 hover:bg-amber-800/50 transition-colors text-sm first:rounded-t-lg"
                    >
                      Fresh Value
                    </button>
                  )}
                  {showUsedValue && (
                    <button
                      onClick={() => handleValueSelection('used')}
                      className="w-full px-3 py-2 text-left text-amber-200 hover:bg-amber-800/50 transition-colors text-sm last:rounded-b-lg"
                    >
                      Used/Upgraded Value
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Brown line under value */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-700 to-transparent"></div>

        <div className="flex justify-between">
          <div className="text-center">
            <p className="text-amber-200 text-sm mb-1">Demand</p>
            <p className="text-amber-100 font-semibold">{demand}</p>
          </div>
          
          <div className="text-center">
            <p className="text-amber-200 text-sm mb-1">Status</p>
            <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>
        </div>

        {/* Brown line under demand and status */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-700 to-transparent"></div>
      </div>
    </div>
  );
};

export default ItemCard;