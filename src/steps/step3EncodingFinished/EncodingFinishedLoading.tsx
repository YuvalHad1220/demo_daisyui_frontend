import React from 'react';
import LoadingCircular from '../../components/ui/LoadingCircular';

const EncodingFinishedLoading: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full py-12">
    <LoadingCircular size="md" className="mb-4" />
    <span className="font-semibold text-xl" style={{ color: '#111827' }}>Finalizing Encoding...</span>
  </div>
);

export default EncodingFinishedLoading;
