export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Budget Manager
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your personal finance management application
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-green-600 mb-2">
              ✅ Next.js Frontend
            </h2>
            <p className="text-sm text-gray-600">
              React 19 + TypeScript + Tailwind CSS
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-blue-600 mb-2">
              🔄 Node.js Backend
            </h2>
            <p className="text-sm text-gray-600">
              API Routes + Server Components
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-purple-600 mb-2">
              🗄️ Supabase Database
            </h2>
            <p className="text-sm text-gray-600">
              PostgreSQL + Real-time + Auth
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-8">
          Ready to implement features modularly!
        </p>
      </div>
    </div>
  );
}
