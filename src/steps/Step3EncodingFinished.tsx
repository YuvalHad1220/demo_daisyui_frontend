import React from 'react';
import { Zap } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { useWorkflow } from '../hooks/WorkflowContext';
import EncodingFinishedLoading from './step3EncodingFinished/EncodingFinishedLoading';
import EncodingStats from './step3EncodingFinished/EncodingStats';
import EncodingComparisonChart from './step3EncodingFinished/EncodingComparisonChart';
import EncodingAdvancedDetails from './step3EncodingFinished/EncodingAdvancedDetails';

const Step3EncodingFinished: React.FC<{ onResetGroup: () => void; isFirstStepInGroup: boolean }> = ({ onResetGroup, isFirstStepInGroup }) => {
  const { encoding } = useWorkflow();
  const { encodingResult, resetEncode } = encoding;
  const [resetting, setResetting] = React.useState(false);

  const handleReset = async () => {
    setResetting(true);
    await resetEncode();
    onResetGroup();
    setResetting(false);
  };

  return (
    <StageCard
      title="Video Encoding"
      icon={Zap}
      showReset={isFirstStepInGroup}
      resetTitle="Reset Encoding"
      onResetClick={handleReset}
      resetting={resetting}
    >
      {!encodingResult ? (
        <EncodingFinishedLoading />
      ) : (
        <>
          <EncodingStats
            duration={encodingResult.duration.toString()}
            compression={Math.round(((encodingResult.inputSize - encodingResult.outputSize) / encodingResult.inputSize) * 100)}
            saved={(encodingResult.inputSize - encodingResult.outputSize).toFixed(2)}
          />
          <EncodingComparisonChart inputSize={encodingResult.inputSize} outputSize={encodingResult.outputSize} />
          <EncodingAdvancedDetails
            psnr={encodingResult.psnr.toFixed(1)}
            bitrate={encodingResult.bitrate.toString()}
            compressionType={encodingResult.compressionType}
            codec={encodingResult.codec}
          />
        </>
      )}
    </StageCard>
  );
};

export default Step3EncodingFinished; 