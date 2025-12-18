'use client';

export default function LanguageSelector() {
  return (
    <select className="bg-white border border-gray-300 text-gray-700 py-1 px-3 rounded shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-green-500">
      <option value="en">English (English)</option>
      <option value="hi">Hindi (हिंदी)</option>
      <option value="mr">Marathi (मराठी)</option>
      <option value="gu">Gujarati (ગુજરાતી)</option>
    </select>
  );
}
