import React from 'react';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { AppButton } from '../../components/ui/AppButton';

interface DecodingErrorStateProps {
  decodingError: string | null;
  onRetry: () => void;
}

const DecodingErrorState: React.FC<DecodingErrorStateProps> = ({ decodingError, onRetry }) => (
  <div className="space-y-4 animate-shake">
    <ErrorAlert title="Decoding Failed" message={decodingError} />
    <AppButton onClick={onRetry} className="w-full" style={{ color: '#374151', background: '#f3f4f6', border: '1px solid #d1d5db' }}>
      Try Again
    </AppButton>
  </div>
);

export default DecodingErrorState;
