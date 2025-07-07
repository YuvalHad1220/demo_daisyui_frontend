import React, { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import DecodingStats from './step6DecodingFinished/DecodingStats';
import PsnrComparisonBar from './step6DecodingFinished/PsnrComparisonBar';
import DecodingAdvancedDetails from './step6DecodingFinished/DecodingAdvancedDetails';

const Step6DecodingFinished: React.FC = () => {
  // Simulated data
  const inputSize = 20.7; // MB
  const outputSize = 18.2; // MB
  const frameCount = 1800;
  const duration = 60; // seconds
  const psnr = 38.2; // dB (actual)
  const expectedPsnr = 40.0; // dB (expected)
  const ssim = 0.98;
  const maxPsnr = 50;

  return (
    <StageCard
      title="Decoding Summary"
      icon={BarChart2}
    >
      <div className="px-6 py-8 flex flex-col items-center">
        <DecodingStats duration={duration} frameCount={frameCount} psnr={psnr} />
        <PsnrComparisonBar psnr={psnr} expectedPsnr={expectedPsnr} maxPsnr={maxPsnr} />
        <DecodingAdvancedDetails ssim={ssim} frameCount={frameCount} />
      </div>
    </StageCard>
  );
};

export default Step6DecodingFinished; 