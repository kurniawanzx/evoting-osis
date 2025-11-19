import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">
                🗳️ E-Voting OSIS
              </h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/admin/login" className="text-gray-600 hover:text-blue-600">
                Admin
              </Link>
              <Link href="/voting" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Mulai Voting
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Pemilihan Ketua 
              <span className="text-blue-600"> OSIS Digital</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sistem voting online yang aman, transparan, dan real-time untuk 
              memilih ketua dan wakil ketua OSIS periode mendatang.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/voting" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                🗳️ Mulai Voting
              </Link>
              <Link href="/results" className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 font-semibold">
                📊 Lihat Hasil
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Mengapa E-Voting?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: "⚡",
    title: "Cepat & Efisien",
    description: "Proses voting hanya dalam hitungan menit tanpa antrian panjang"
  },
  {
    icon: "🔒",
    title: "Aman & Terjamin",
    description: "Satu siswa satu suara dengan sistem verifikasi NIS yang ketat"
  },
  {
    icon: "📊",
    title: "Hasil Real-time",
    description: "Pantau perkembangan hasil voting secara live dan transparan"
  }
];
