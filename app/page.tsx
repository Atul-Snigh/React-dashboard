import Link from 'next/link';
import { ArrowRight, ShieldCheck, Users, Zap, LayoutDashboard } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
        {/* Navbar */}
        <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20 max-w-7xl mx-auto right-0">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter text-gray-900">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
            <span>NEXUS</span>
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
            <Link href="/signup" className="text-gray-600 hover:text-gray-900 transition-colors">Sign Up</Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="z-10 max-w-3xl w-full text-center space-y-8 mt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 mb-4 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Online
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
            Control your data. <br />
            <span className="text-gray-500">Secure and simple.</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            A minimalist dashboard for managing users and permissions with zero clutter. Focus on what matters.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link
              href="/signup"
              className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition duration-200 flex items-center gap-2 shadow-sm"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition duration-200 shadow-sm"
            >
              Sign In
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20 text-left">
            <div className="group p-6 rounded-xl bg-white border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300">
              <ShieldCheck className="w-6 h-6 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-semibold text-gray-900 mb-2">Secure</h3>
              <p className="text-gray-500 text-sm">Encrypted data and secure sessions.</p>
            </div>
            <div className="group p-6 rounded-xl bg-white border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300">
              <Users className="w-6 h-6 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-semibold text-gray-900 mb-2">Roles</h3>
              <p className="text-gray-500 text-sm">Admin and User permission levels.</p>
            </div>
            <div className="group p-6 rounded-xl bg-white border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300">
              <Zap className="w-6 h-6 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-semibold text-gray-900 mb-2">Fast</h3>
              <p className="text-gray-500 text-sm">Powered by Neon DB and Next.js.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
