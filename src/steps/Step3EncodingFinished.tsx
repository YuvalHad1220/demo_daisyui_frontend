import React from 'react';
import { Zap } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { useWorkflow } from '../hooks/WorkflowContext';
import EncodingFinishedLoading from './step3EncodingFinished/EncodingFinishedLoading';
import EncodingStats from './step3EncodingFinished/EncodingStats';
import EncodingComparisonChart from './step3EncodingFinished/EncodingComparisonChart';
import EncodingAdvancedDetails from './step3EncodingFinished/EncodingAdvancedDetails';

const Step3EncodingFinished: React.FC = () => {
  const { encoding } = useWorkflow();
  const { encodingResult } = encoding;

  if (!encodingResult) {
    return <EncodingFinishedLoading />;
  }

  const { inputSize, outputSize, duration, psnr, compressionType, codec, bitrate } = encodingResult;
  const saved = (inputSize - outputSize).toFixed(2);
  const compression = Math.round(((inputSize - outputSize) / inputSize) * 100);

  return (
    <StageCard title="Video Encoding" icon={Zap}>
      <EncodingStats duration={duration.toString()} compression={compression} saved={saved} />
      <EncodingComparisonChart inputSize={inputSize} outputSize={outputSize} />
      <EncodingAdvancedDetails
        psnr={psnr.toFixed(1)}
        bitrate={bitrate.toString()}
        compressionType={compressionType}
        codec={codec}
      />
    </StageCard>
  );
};

export default Step3EncodingFinished; 