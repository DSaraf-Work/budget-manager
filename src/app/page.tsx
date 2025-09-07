import { Navigation } from '@/components/Navigation'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h1 className="text-5xl font-bold mb-4">
            Budget Manager
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Your comprehensive personal finance management solution
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-lg font-semibold mb-2">Next.js Frontend</h3>
              <p className="text-blue-100 text-sm">
                React 19 + TypeScript + Tailwind CSS
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="text-lg font-semibold mb-2">Node.js Backend</h3>
              <p className="text-blue-100 text-sm">
                API Routes + Server Components
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-3">🗄️</div>
              <h3 className="text-lg font-semibold mb-2">Supabase Database</h3>
              <p className="text-blue-100 text-sm">
                PostgreSQL + Real-time + Auth
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="py-12">
        <Navigation />
      </div>
    </div>
  );
}
