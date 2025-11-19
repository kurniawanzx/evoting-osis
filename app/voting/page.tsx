'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CandidateCard from '../../components/Voting/CandidateCard';

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

interface Student {
  nis: string;
  nama: string;
  kelas: string;
}

export default function VotingPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [loginData, setLoginData] = useState({ nis: '', password: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if student is logged in from localStorage
    const studentData = localStorage.getItem('student_data');
    if (studentData) {
      setStudent(JSON.parse(studentData));
      setIsLoggedIn(true);
      fetchCandidates();
      checkVoteStatus(JSON.parse(studentData).nis);
    }
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates');
      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const checkVoteStatus = async (nis: string) => {
    try {
      // For now, we'll assume not voted if we can't check
      // In real implementation, you'd call an API to check vote status
      setHasVoted(false);
    } catch (error) {
      console.error('Error checking vote status:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success) {
        setStudent(data.student);
        setIsLoggedIn(true);
        localStorage.setItem('student_data', JSON.stringify(data.student));
        fetchCandidates();
        checkVoteStatus(data.student.nis);
      } else {
        setLoginError(data.error);
      }
    } catch (error) {
      setLoginError('Terjadi kesalahan saat login');
    }
  };

  const handleVote = async (candidateId: string) => {
    if (!student || hasVoted) return;

    setIsVoting(true);
    try {
      const response = await fetch('/api/voting/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nis: student.nis,
          candidateId
        }),
      });

      const data = await response.json();

      if (data.success) {
        setHasVoted(true);
        localStorage.removeItem('student_data');
        alert('Vote Anda berhasil dicatat! Terima kasih telah berpartisipasi.');
        router.push('/results');
      } else {
        alert('Gagal melakukan vote: ' + data.error);
      }
    } catch (error) {
      alert('Terjadi kesalahan saat melakukan vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('student_data');
    setStudent(null);
    setIsLoggedIn(false);
    setLoginData({ nis: '', password: '' });
  };

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Terima Kasih!
            </h1>
            <p className="text-gray-600 mb-6">
              Anda sudah menggunakan hak pilih Anda. Terima kasih telah berpartisipasi 
              dalam pemilihan ketua OSIS.
            </p>
            <button
              onClick={() => router.push('/results')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Lihat Hasil Pemilihan
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Login Voting</h1>
              <p className="text-gray-600">Masukkan NIS dan password untuk memilih</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIS
                </label>
                <input
                  type="text"
                  value={loginData.nis}
                  onChange={(e) => setLoginData({...loginData, nis: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Password default: NIS Anda</p>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{loginError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Login
              </button>
            </form>
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
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handleLogout}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Logout
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Pemilihan Ketua OSIS
            </h1>
            <div></div> {/* Spacer for flex alignment */}
          </div>
          
          {student && (
            <p className="text-gray-600">
              Halo <strong>{student.nama}</strong> ({student.kelas}) - NIS: {student.nis}
            </p>
          )}
          <p className="text-gray-500 mt-2">
            Pilih satu kandidat yang menurut Anda paling capable memimpin OSIS
          </p>
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate._id}
              candidate={candidate}
              onVote={handleVote}
              isVoting={isVoting}
            />
          ))}
        </div>

        {candidates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-600">
              Belum ada kandidat yang terdaftar
            </h3>
            <p className="text-gray-500">Silakan hubungi admin untuk informasi lebih lanjut.</p>
          </div>
        )}
      </div>
    </div>
  );
}
