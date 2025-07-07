import React from 'react';
import { Clock, TrendingDown, BarChart2 } from 'lucide-react';
import { FileInfoCard } from '../../components/ui/FileInfoCard';

interface EncodingStatsProps {
  duration: string;
  compression: number;
  saved: string;
}

const EncodingStats: React.FC<EncodingStatsProps> = ({ duration, compression, saved }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 mt-6">
    <FileInfoCard
      icon={Clock}
      iconColor="#2563eb"
      backgroundColor="#dbeafe"
      label="Duration"
      value={`${duration}s`}
    />
    <FileInfoCard
      icon={TrendingDown}
      iconColor="#14b8a6"
      backgroundColor="#f0fdfa"
      label="Compression"
      value={`${compression}.0%`}
    />
    <FileInfoCard
      icon={BarChart2}
      iconColor="#7c3aed"
      backgroundColor="#faf5ff"
      label="Saved"
      value={`${saved} MB`}
    />
  </div>
);

export default EncodingStats;
