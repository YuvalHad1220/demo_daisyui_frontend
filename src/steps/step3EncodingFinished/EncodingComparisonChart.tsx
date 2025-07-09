import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface EncodingComparisonChartProps {
  inputSize: number;
  outputSize: number;
}

const EncodingComparisonChart: React.FC<EncodingComparisonChartProps> = ({ inputSize, outputSize }) => {
  const chartData = [
    { name: 'Original', size: inputSize, color: '#ef4444' },
    { name: 'Encoded', size: outputSize, color: '#14b8a6' },
  ];
  console.log(inputSize, outputSize)
  return (
    <div className="px-6 mt-8">
      <div className="rounded-lg p-4 border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
        <div className="font-semibold text-sm mb-3" style={{ color: '#374151' }}>Size Comparison</div>
        <div style={{ width: '100%', height: 180, maxWidth: 400, margin: '0 auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} />
              <Tooltip formatter={(value: number) => `${value} MB`} />
              <Bar dataKey="size" radius={[8, 8, 8, 8]}>
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EncodingComparisonChart;
