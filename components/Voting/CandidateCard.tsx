'use client';

import { useState } from 'react';

interface Candidate {
  _id: string;
  nomorUrut: number;
  ketua: {
    nama: string;
    foto?: string;
    visi: string;
    misi: string[];
  };
  wakil: {
    nama: string;
    foto?: string;
    visi: string;
    misi: string[];
  };
  program: string[];
  color: string;
}

interface CandidateCardProps {
  candidate: Candidate;
  onVote: (candidateId: string) => void;
  isVoting: boolean;
}

export default function CandidateCard({ candidate, onVote, isVoting }: CandidateCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`p-6 text-white`} style={{ backgroundColor: candidate.color }}>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold">#{candidate.nomorUrut}</span>
            <h3 className="text-xl font-bold mt-2">KANDIDAT {candidate.nomorUrut}</h3>
          </div>
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            {showDetail ? 'Tutup' : 'Detail'}
          </button>
        </div>
      </div>

      {/* Candidate Info */}
      <div className="p-6">
        <div className="text-center mb-4">
          <h4 className="font-bold text-lg text-gray-800">Ketua: {candidate.ketua.nama}</h4>
          <h4 className="font-bold text-lg text-gray-800">Wakil: {candidate.wakil.nama}</h4>
        </div>

        {showDetail && (
          <div className="space-y-4 mb-6">
            <div>
              <h5 className="font-semibold text-gray-700 mb-2">Visi:</h5>
              <p className="text-gray-600 text-sm">{candidate.ketua.visi}</p>
            </div>
            
            <div>
              <h5 className="font-semibold text-gray-700 mb-2">Misi:</h5>
              <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                {candidate.ketua.misi.map((misi, index) => (
                  <li key={index}>{misi}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-700 mb-2">Program Unggulan:</h5>
              <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                {candidate.program.map((program, index) => (
                  <li key={index}>{program}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <button
          onClick={() => onVote(candidate._id)}
          disabled={isVoting}
          className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-colors ${
            isVoting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isVoting ? 'Memproses...' : 'PILIH'}
        </button>
      </div>
    </div>
  );
}
