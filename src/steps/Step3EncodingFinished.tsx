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
            datasetCreationTime={encodingResult.datasetCreationTimeS || 0}
            compressionRatio={encodingResult.compressionRatio || 0}
            psnr={encodingResult.psnr || 0}
          />
          <EncodingComparisonChart inputSize={encodingResult.inputSize} outputSize={encodingResult.outputSize} />
          <EncodingAdvancedDetails
            bitrate={encodingResult.bitrate || 0}
            method={encodingResult.method || 'Unknown'}
            deviceUsed={encodingResult.deviceUsed || 'CPU'}
            memoryUsageBytes={encodingResult.memoryUsageBytes || 0}
            videoFrames={encodingResult.videoFrames || 0}
            fps={encodingResult.fps || 0}
            validSequences={encodingResult.validSequences || 0}
            duration={encodingResult.duration || 0}
          />
        </>
      )}
    </StageCard>
  );
};

export default Step3EncodingFinished; 