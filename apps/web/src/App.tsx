export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 space-y-6 w-[400px] text-center">
        <h1 className="text-3xl font-bold text-gray-900">Convo UI Test</h1>

        <p className="text-gray-600">Testing Tailwind + Inter Font</p>

        <div className="space-y-2">
          <p className="text-xl font-light">Font Weight 300 (Light)</p>
          <p className="text-xl font-normal">Font Weight 400 (Normal)</p>
          <p className="text-xl font-semibold">Font Weight 600 (SemiBold)</p>
          <p className="text-xl font-bold">Font Weight 700 (Bold)</p>
        </div>

        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
          Tailwind Button Test
        </button>

        <div className="text-xs text-gray-400 pt-4">
          If everything looks clean → Tailwind + Inter is working ✔
        </div>
      </div>
    </div>
  );
}
