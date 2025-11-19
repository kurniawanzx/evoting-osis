'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Student {
  nis: string;
  nama: string;
  kelas: string;
  hasVoted: boolean;
  votedAt?: string;
}

interface Candidate {
  _id: string;
  nomorUrut: number;
  ketua: { nama: string };
  wakil: { nama: string };
  voteCount: number;
  percentage: number;
  color: string;
}

interface ClassStat {
  kelas: string;
  total: number;
  voted: number;
  percentage: number;
}

interface Admin {
  id: string;
  username: string;
  name: string;
  role: string;
}

export default function AdminPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classStats, setClassStats] = useState<ClassStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newCandidate, setNewCandidate] = useState({
    nomorUrut: '',
    ketua: { nama: '', visi: '', misi: [''] },
    wakil: { nama: '', visi: '', misi: [''] },
    program: [''],
    color: '#3B82F6'
  });
  const [resetLoading, setResetLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('admin_data');
    if (!adminData) {
      router.push('/admin/login');
      return;
    }
    
    setAdmin(JSON.parse(adminData));
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/statistics');
      const data = await response.json();
      setStatistics(data.statistics);
      setCandidates(data.candidates);
      setStudents(data.students);
      setClassStats(data.classStats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_data');
    router.push('/admin/login');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/import-students', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        fetchData();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error uploading file');
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newCandidate,
          nomorUrut: parseInt(newCandidate.nomorUrut)
        }),
      });

      const data = await response.json();
      
      if (data._id) {
        alert('Kandidat berhasil ditambahkan!');
        setNewCandidate({
          nomorUrut: '',
          ketua: { nama: '', visi: '', misi: [''] },
          wakil: { nama: '', visi: '', misi: [''] },
          program: [''],
          color: '#3B82F6'
        });
        fetchData();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error adding candidate');
    }
  };

  const handleResetVoting = async () => {
    if (!confirm('⚠️ APAKAH ANDA YAKIN?\n\nReset pemilihan akan:\n• Menghapus semua suara yang sudah terkumpul\n• Mengembalikan status semua siswa menjadi "belum memilih"\n• Mengosongkan hasil pemilihan\n\nTindakan ini tidak dapat dibatalkan!')) {
      return;
    }

    setResetLoading(true);
    try {
      const response = await fetch('/api/admin/reset-voting', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${data.message}`);
        fetchData();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error resetting voting');
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteCandidate = async (candidateId: string, nomorUrut: number) => {
    if (!confirm(`⚠️ Hapus Kandidat #${nomorUrut}?\n\nTindakan ini tidak dapat dibatalkan!`)) {
      return;
    }

    setDeleteLoading(candidateId);
    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${data.message}`);
        fetchData();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error deleting candidate');
    } finally {
      setDeleteLoading(null);
    }
  };

  const addMisiField = (type: 'ketua' | 'wakil') => {
    setNewCandidate(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        misi: [...prev[type].misi, '']
      }
    }));
  };

  const addProgramField = () => {
    setNewCandidate(prev => ({
      ...prev,
      program: [...prev.program, '']
    }));
  };

  const updateMisi = (type: 'ketua' | 'wakil', index: number, value: string) => {
    setNewCandidate(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        misi: prev[type].misi.map((m, i) => i === index ? value : m)
      }
    }));
  };

  const updateProgram = (index: number, value: string) => {
    setNewCandidate(prev => ({
      ...prev,
      program: prev.program.map((p, i) => i === index ? value : p)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">Memuat data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                🛠️ Admin Dashboard
              </h1>
              {admin && (
                <p className="text-sm text-gray-600">
                  Welcome, {admin.name} ({admin.role})
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
              >
                🔄 Refresh
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {['dashboard', 'students', 'candidates', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'dashboard' && '📊 Dashboard'}
                {tab === 'students' && '👥 Data Siswa'}
                {tab === 'candidates' && '🗳️ Kandidat'}
                {tab === 'settings' && '⚙️ Settings'}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && statistics && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {statistics.totalStudents}
                </div>
                <div className="text-sm text-gray-600">Total Siswa</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {statistics.votedStudents}
                </div>
                <div className="text-sm text-gray-600">Sudah Memilih</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {statistics.abstain}
                </div>
                <div className="text-sm text-gray-600">Belum Memilih</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {statistics.participationRate}%
                </div>
                <div className="text-sm text-gray-600">Partisipasi</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Quick Actions
              </h3>
              <div className="flex space-x-4">
                <button
                  onClick={handleResetVoting}
                  disabled={resetLoading}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    resetLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {resetLoading ? 'Resetting...' : '🔄 Reset Pemilihan'}
                </button>
                <button
                  onClick={() => setActiveTab('candidates')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
                >
                  ➕ Tambah Kandidat
                </button>
              </div>
            </div>

            {/* Candidates Results */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Hasil Pemilihan
              </h3>
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <div key={candidate._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-bold text-lg">#{candidate.nomorUrut}</span>
                        <div className="text-sm text-gray-600">
                          {candidate.ketua.nama} & {candidate.wakil.nama}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          {candidate.voteCount} suara
                        </div>
                        <div className="text-sm text-gray-600">
                          {candidate.percentage}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${candidate.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Class Statistics */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Partisipasi per Kelas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {classStats.map((classStat) => (
                  <div key={classStat.kelas} className="border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-800">{classStat.kelas}</div>
                    <div className="text-sm text-gray-600">
                      {classStat.voted} dari {classStat.total} siswa
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(classStat.percentage)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Import Students */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Import Data Siswa
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Upload file Excel dengan format: nis, nama, kelas
                  </p>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Daftar Siswa ({students.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NIS
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kelas
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.nis}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.nis}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {student.nama}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.kelas}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            student.hasVoted 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {student.hasVoted ? 'Sudah Memilih' : 'Belum Memilih'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <div className="space-y-6">
            {/* Add Candidate Form */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Tambah Kandidat Baru
              </h3>
              <form onSubmit={handleAddCandidate} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Urut
                    </label>
                    <input
                      type="number"
                      value={newCandidate.nomorUrut}
                      onChange={(e) => setNewCandidate({...newCandidate, nomorUrut: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warna
                    </label>
                    <input
                      type="color"
                      value={newCandidate.color}
                      onChange={(e) => setNewCandidate({...newCandidate, color: e.target.value})}
                      className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Ketua OSIS */}
                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Ketua OSIS</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Ketua
                      </label>
                      <input
                        type="text"
                        value={newCandidate.ketua.nama}
                        onChange={(e) => setNewCandidate({
                          ...newCandidate, 
                          ketua: {...newCandidate.ketua, nama: e.target.value}
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visi
                      </label>
                      <textarea
                        value={newCandidate.ketua.visi}
                        onChange={(e) => setNewCandidate({
                          ...newCandidate, 
                          ketua: {...newCandidate.ketua, visi: e.target.value}
                        })}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Misi
                      </label>
                      {newCandidate.ketua.misi.map((misi, index) => (
                        <input
                          key={index}
                          type="text"
                          value={misi}
                          onChange={(e) => updateMisi('ketua', index, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Misi ${index + 1}`}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => addMisiField('ketua')}
                        className="bg-gray-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-600"
                      >
                        + Tambah Misi
                      </button>
                    </div>
                  </div>
                </div>

                {/* Wakil Ketua OSIS */}
                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Wakil Ketua OSIS</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Wakil
                      </label>
                      <input
                        type="text"
                        value={newCandidate.wakil.nama}
                        onChange={(e) => setNewCandidate({
                          ...newCandidate, 
                          wakil: {...newCandidate.wakil, nama: e.target.value}
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visi
                      </label>
                      <textarea
                        value={newCandidate.wakil.visi}
                        onChange={(e) => setNewCandidate({
                          ...newCandidate, 
                          wakil: {...newCandidate.wakil, visi: e.target.value}
                        })}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Misi
                      </label>
                      {newCandidate.wakil.misi.map((misi, index) => (
                        <input
                          key={index}
                          type="text"
                          value={misi}
                          onChange={(e) => updateMisi('wakil', index, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Misi ${index + 1}`}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => addMisiField('wakil')}
                        className="bg-gray-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-600"
                      >
                        + Tambah Misi
                      </button>
                    </div>
                  </div>
                </div>

                {/* Program Unggulan */}
                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Program Unggulan</h4>
                  {newCandidate.program.map((program, index) => (
                    <input
                      key={index}
                      type="text"
                      value={program}
                      onChange={(e) => updateProgram(index, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Program ${index + 1}`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addProgramField}
                    className="bg-gray-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-600"
                  >
                    + Tambah Program
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Tambah Kandidat
                </button>
              </form>
            </div>

            {/* Existing Candidates */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Kandidat Terdaftar ({candidates.length})
                </h3>
                <button
                  onClick={handleResetVoting}
                  disabled={resetLoading}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    resetLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {resetLoading ? 'Resetting...' : '🔄 Reset Semua Suara'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {candidates.map((candidate) => (
                  <div key={candidate._id} className="border border-gray-200 rounded-lg p-4 relative">
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteCandidate(candidate._id, candidate.nomorUrut)}
                      disabled={deleteLoading === candidate._id}
                      className={`absolute top-3 right-3 p-1 rounded ${
                        deleteLoading === candidate._id
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                      title="Hapus Kandidat"
                    >
                      {deleteLoading === candidate._id ? '...' : '🗑️'}
                    </button>

                    <div 
                      className="p-4 text-white rounded-t-lg mb-4"
                      style={{ backgroundColor: candidate.color || '#3B82F6' }}
                    >
                      <div className="text-2xl font-bold">#{candidate.nomorUrut}</div>
                      <div className="text-lg font-semibold">KANDIDAT {candidate.nomorUrut}</div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <strong>Ketua:</strong> {candidate.ketua.nama}
                      </div>
                      <div>
                        <strong>Wakil:</strong> {candidate.wakil.nama}
                      </div>
                      <div>
                        <strong>Suara:</strong> {candidate.voteCount} ({candidate.percentage}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* System Settings */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                ⚙️ System Settings
              </h3>
              
              <div className="space-y-4">
                {/* Reset Voting */}
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="font-semibold text-red-800 mb-2">Reset Pemilihan</h4>
                  <p className="text-sm text-red-600 mb-3">
                    Tindakan ini akan menghapus semua suara yang sudah terkumpul dan mengembalikan 
                    status semua siswa menjadi "belum memilih". Data kandidat tetap tersimpan.
                  </p>
                  <button
                    onClick={handleResetVoting}
                    disabled={resetLoading}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      resetLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {resetLoading ? '🔄 Resetting...' : '🔄 Reset Pemilihan'}
                  </button>
                </div>

                {/* Current Statistics */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-800 mb-2">Current Statistics</h4>
                  {statistics && (
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Total Siswa: {statistics.totalStudents}</div>
                      <div>Sudah Memilih: {statistics.votedStudents}</div>
                      <div>Belum Memilih: {statistics.abstain}</div>
                      <div>Partisipasi: {statistics.participationRate}%</div>
                      <div>Jumlah Kandidat: {candidates.length}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
