'use client';
import dynamic from 'next/dynamic';
const ClaimProcessor = dynamic(() => import('@/widgets/ClaimProcessor'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] selection:bg-purple-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/80 to-slate-950 pointer-events-none" />
      
      <div className="z-10 w-full max-w-5xl flex flex-col items-center">
        <header className="mb-12 text-center flex flex-col items-center">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md inline-block mb-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-white via-indigo-200 to-indigo-500 text-transparent bg-clip-text">
              ClaimBridge
            </h1>
          </div>
          <p className="text-lg text-slate-400 font-medium max-w-md">
            Seamlessly bridge your vehicle damage with your insurance policy using AI.
          </p>
        </header>

        <section className="w-full">
          <ClaimProcessor />
        </section>
      </div>
    </main>
  );
}
