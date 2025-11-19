'use client';

import { useState, useEffect } from 'react';
import ResultsChart from '../../components/Results/ResultsChart';

interface Candidate {
  _id: string;
  nomorUrut: number;
  ketua: { nama: string };
  wakil: { nama: string };
  voteCount: number;
  percentage: number;
  color: string;
}

export default function ResultsPage() {
  const [results, setResults] = useState<{
    candidates: Candidate[];
    statistics: {
      totalStudents: number;
      votedStudents: number;
      abstain: number;
      participationRate: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results/live');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-2xl font-bold text-gray-800 mb-4">
              Memuat hasil...
            </div>
            <p className="text-gray-600">Sedang mengambil data terbaru</p>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-2xl font-bold text-gray-800 mb-4">
              Tidak ada data
            </div>
            <p className="text-gray-600">Belum ada hasil yang dapat ditampilkan</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hasil Pemilihan Ketua OSIS
          </h1>
          <p className="text-gray-600">
            Data diperbarui secara real-time
          </p>
          <button
            onClick={fetchResults}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Results Chart */}
        <div className="mb-8">
          <ResultsChart 
            data={results.candidates} 
            statistics={results.statistics} 
          />
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Detail Perolehan Suara
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kandidat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah Suara
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Persentase
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.candidates.map((candidate) => (
                  <tr key={candidate._id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold">#{candidate.nomorUrut}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900">
                        {candidate.ketua.nama}
                      </div>
                      <div className="text-sm text-gray-500">
                        & {candidate.wakil.nama}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-gray-900">
                        {candidate.voteCount} suara
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-lg font-bold text-green-600 mr-2">
                          {candidate.percentage}%
                        </div>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${candidate.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {results.statistics.totalStudents}
            </div>
            <div className="text-sm text-gray-600">Total Siswa</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center">
            <div className="text-3xl font-bold text-green-600">
              {results.statistics.votedStudents}
            </div>
            <div className="text-sm text-gray-600">Sudah Memilih</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {results.statistics.participationRate}%
            </div>
            <div className="text-sm text-gray-600">Tingkat Partisipasi</div>
          </div>
        </div>
      </div>
    </div>
  );
}
