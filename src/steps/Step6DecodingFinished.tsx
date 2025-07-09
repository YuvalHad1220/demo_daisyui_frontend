import React from 'react';
import { BarChart2 } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import DecodingStats from './step6DecodingFinished/DecodingStats';
import PsnrComparisonBar from './step6DecodingFinished/PsnrComparisonBar';
import DecodingAdvancedDetails from './step6DecodingFinished/DecodingAdvancedDetails';
import { useWorkflow } from '../hooks/WorkflowContext';

const Step6DecodingFinished: React.FC<{ onResetGroup: () => void; isFirstStepInGroup: boolean }> = ({ onResetGroup, isFirstStepInGroup }) => {
  const { decoding } = useWorkflow();
  const decodingResult = decoding.decodingResult;

  // Fallbacks for null result
  const duration = decodingResult?.duration ?? 0;
  const frameCount = decodingResult?.frameCount ?? 0;
  const psnr = decodingResult?.psnr ?? 0;
  const expectedPsnr = decodingResult?.expectedPsnr ?? 0;
  const ssim = decodingResult?.ssim;
  const maxPsnr = 50;

  return (
    <StageCard
      title="Decoding Summary"
      icon={BarChart2}
      showReset={isFirstStepInGroup}
      resetTitle="Reset Decoding"
      onResetClick={onResetGroup}
    >
      <div className="px-6 py-8 flex flex-col items-center">
        <DecodingStats
          duration={duration}
          frameCount={frameCount}
          psnr={psnr}
        />
        <PsnrComparisonBar
          psnr={psnr}
          expectedPsnr={expectedPsnr}
          maxPsnr={maxPsnr}
        />
        <DecodingAdvancedDetails
          ssim={ssim}
          psnrStd={decodingResult?.psnrStd}
          processedSequences={decodingResult?.processedSequences}
          bitrateMbps={decodingResult?.bitrateMbps}
          memoryIncreaseMB={decodingResult?.memoryIncreaseMB}
          lightningEnabled={decodingResult?.lightningEnabled}
        />
      </div>
    </StageCard>
  );
};

export default Step6DecodingFinished; 