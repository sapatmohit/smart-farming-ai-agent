import ChatBox from '@/components/ChatBox';
import LanguageSelector from '@/components/LanguageSelector';

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-100 flex flex-col items-center py-10">
      <header className="w-full max-w-5xl px-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-green-800 tracking-tight">Kisan Mitra AI 🌾</h1>
          <p className="text-gray-600 mt-1">Your intelligent companion for smart farming decisions.</p>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm font-medium">Language:</span>
            <LanguageSelector />
        </div>
      </header>

      <div className="w-full max-w-5xl px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <ChatBox />
        </div>
        <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-yellow-400">
                <h3 className="font-bold text-lg mb-2 text-gray-800">🌤️ Live Weather</h3>
                <p className="text-gray-600 text-sm">Pune, IN: 28°C <span className="block mt-1">Partly Cloudy. Chance of rain: 10%</span></p>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-500">
                <h3 className="font-bold text-lg mb-2 text-gray-800">💰 Market Prices</h3>
                <p className="text-gray-600 text-sm">Wheat (Lokwan): ₹2,400 / Qt</p>
                <p className="text-gray-600 text-sm mt-1">Onion (Red): ₹1,800 / Qt</p>
            </div>

             <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
                <h3 className="font-bold text-lg mb-2 text-gray-800">📢 Tips</h3>
                <p className="text-gray-600 text-sm">Consider soil testing before the next sowing cycle for better yield.</p>
            </div>
        </div>
      </div>
    </main>
  );
}
