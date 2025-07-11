import React from 'react';
import { ErrorAlert } from '../../components/ui/ErrorAlert';

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => (
  <div className="animate-shake">
    <ErrorAlert title="Upload Failed" message={error} />
  </div>
);

export default ErrorDisplay;
