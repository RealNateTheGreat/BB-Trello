import React from 'react';
import { X, Info } from 'lucide-react';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StatusModal: React.FC<StatusModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const statusInfo = [
    {
      status: 'Stable',
      color: 'text-green-400 bg-green-500/20 border-green-500/50',
      description: 'The value of the item is well established and won\'t likely increase or decrease in value dramatically.'
    },
    {
      status: 'Unstable',
      color: 'text-red-400 bg-red-500/20 border-red-500/50',
      description: 'The value of the item has yet to be stabilized. It will likely decrease for a while.'
    },
    {
      status: 'Fluctuating',
      color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50',
      description: 'The item has not been stabilized. Value may go up OR down. These items are usually traded for less than the listed value.'
    },
    {
      status: 'Underpaid',
      color: 'text-orange-400 bg-orange-500/20 border-orange-500/50',
      description: 'This does not mean that it is impossible to trade it for the listed value. It may, however, be harder.'
    },
    {
      status: 'Overpaid',
      color: 'text-purple-400 bg-purple-500/20 border-purple-500/50',
      description: 'These are popular items in game. They will likely be traded for more than the listed value.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border-2"
        style={{ backgroundColor: '#3D2914', borderColor: '#2D1F0F' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-amber-700/30">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg border"
              style={{ 
                backgroundColor: 'rgba(74, 55, 40, 0.6)',
                borderColor: '#2D1F0F'
              }}
            >
              <Info className="w-6 h-6 text-amber-200" />
            </div>
            <h2 className="text-2xl font-bold text-amber-100">Status Information</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-amber-800/30 transition-colors border"
            style={{ borderColor: '#2D1F0F' }}
          >
            <X className="w-6 h-6 text-amber-200" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-amber-200 text-center mb-8">
            Understanding item status helps you make better trading decisions. Here's what each status means:
          </p>

          {statusInfo.map((info, index) => (
            <div 
              key={index}
              className="rounded-lg p-4 border-2"
              style={{ 
                backgroundColor: 'rgba(74, 55, 40, 0.3)',
                borderColor: '#2D1F0F'
              }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${info.color}`}>
                  {info.status}
                </span>
              </div>
              <p className="text-amber-200 leading-relaxed">
                {info.description}
              </p>
            </div>
          ))}

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-lg text-amber-100 hover:text-white transition-all duration-200 hover:scale-105 font-medium border"
              style={{ 
                backgroundColor: 'rgba(139, 111, 71, 0.8)',
                borderColor: '#2D1F0F'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;