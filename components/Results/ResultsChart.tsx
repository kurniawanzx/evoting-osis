'use client';

import { useEffect, useRef } from 'react';

interface Candidate {
  _id: string;
  nomorUrut: number;
  ketua: { nama: string };
  wakil: { nama: string };
  voteCount: number;
  percentage: number;
  color: string;
}

interface ResultsChartProps {
  data: Candidate[];
  statistics: {
    totalStudents: number;
    votedStudents: number;
    abstain: number;
    participationRate: number;
  };
}

export default function ResultsChart({ data, statistics }: ResultsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && data.length > 0) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const centerX = canvasRef.current.width / 2;
      const centerY = canvasRef.current.height / 2;
      const radius = Math.min(centerX, centerY) - 10;

      let startAngle = 0;

      data.forEach((candidate, index) => {
        const sliceAngle = (2 * Math.PI * candidate.percentage) / 100;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = candidate.color;
        ctx.fill();

        // Label
        const labelAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + (radius + 30) * Math.cos(labelAngle);
        const labelY = centerY + (radius + 30) * Math.sin(labelAngle);

        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          `#${candidate.nomorUrut} (${candidate.percentage}%)`,
          labelX,
          labelY
        );

        startAngle += sliceAngle;
      });

      // Draw abstain section if exists
      const abstainPercentage = 100 - statistics.participationRate;
      if (abstainPercentage > 0) {
        const sliceAngle = (2 * Math.PI * abstainPercentage) / 100;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = '#9CA3AF';
        ctx.fill();

        const labelAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + (radius + 30) * Math.cos(labelAngle);
        const labelY = centerY + (radius + 30) * Math.sin(labelAngle);

        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          `Abstain (${abstainPercentage}%)`,
          labelX,
          labelY
        );
      }
    }
  }, [data, statistics]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Hasil Pemilihan Real-time
      </h3>
      
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0">
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={400}
            className="max-w-full"
          />
        </div>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {statistics.participationRate}%
            </div>
            <div className="text-sm text-gray-600">Tingkat Partisipasi</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">
                {statistics.votedStudents}
              </div>
              <div className="text-sm text-gray-600">Sudah Memilih</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">
                {statistics.abstain}
              </div>
              <div className="text-sm text-gray-600">Belum Memilih</div>
            </div>
          </div>
          
          <div className="space-y-2">
            {data.map((candidate) => (
              <div key={candidate._id} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: candidate.color }}
                />
                <span className="text-sm text-gray-700">
                  Kandidat #{candidate.nomorUrut}: {candidate.voteCount} suara
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
