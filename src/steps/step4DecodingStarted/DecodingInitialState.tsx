import React from 'react';
import { Play } from 'lucide-react';
import { AppButton } from '../../components/ui/AppButton';

interface DecodingInitialStateProps {
  onStartDecoding: () => void;
}

const DecodingInitialState: React.FC<DecodingInitialStateProps> = ({ onStartDecoding }) => (
  <div className="flex flex-col items-center space-y-6 animate-fade-in">
    <AppButton icon={<Play className="w-5 h-5" />} onClick={onStartDecoding}>
      Start Decoding
    </AppButton>
    <p className="text-sm" style={{ color: '#6b7280' }}>
      Click to begin decoding your video for playback.
    </p>
  </div>
);

export default DecodingInitialState;
