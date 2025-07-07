import React from 'react';
import { Play } from 'lucide-react';
import { AppButton } from '../../components/ui/AppButton';

interface EncodingInitialStateProps {
  onStartEncoding: () => void;
}

const EncodingInitialState: React.FC<EncodingInitialStateProps> = ({ onStartEncoding }) => (
  <div className="flex flex-col items-center space-y-6 animate-fade-in">
    <AppButton icon={<Play className="w-5 h-5" />} onClick={onStartEncoding}>
      Start Encoding
    </AppButton>
    <p className="text-sm" style={{ color: '#6b7280' }}>
      Click to begin encoding your video. This may take a few moments.
    </p>
  </div>
);

export default EncodingInitialState;
