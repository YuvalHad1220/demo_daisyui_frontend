import React from 'react';
import { Clock, TrendingDown, BarChart2, HardDrive } from 'lucide-react';
import { FileInfoCard } from '../../components/ui/FileInfoCard';

interface EncodingStatsProps {
  datasetCreationTime: number;
  compressionRatio: number;
  psnr: number;
}

const EncodingStats: React.FC<EncodingStatsProps> = ({ datasetCreationTime, compressionRatio, psnr }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 mt-6">
    <FileInfoCard
      icon={Clock}
      iconColor="#2563eb"
      backgroundColor="#dbeafe"
      label="Processing Time"
      value={`${datasetCreationTime.toFixed(1)}s`}
    />
    <FileInfoCard
      icon={HardDrive}
      iconColor="#7c3aed"
      backgroundColor="#faf5ff"
      label="Compression Ratio"
      value={`${compressionRatio.toFixed(1)}x`}
    />
    <FileInfoCard
      icon={BarChart2}
      iconColor="#eab308"
      backgroundColor="#fef9c3"
      label="PSNR (estimated)"
      value={`${psnr.toFixed(1)} dB`}
    />
  </div>
);

export default EncodingStats;
