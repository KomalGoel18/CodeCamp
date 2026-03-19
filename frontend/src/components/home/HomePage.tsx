import { useNavigate } from "react-router-dom";
import { Github, Linkedin, Globe } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080c0a] text-slate-100 relative overflow-x-hidden font-sans">
      {/* Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#1a3a2c_1px,transparent_1px),linear-gradient(to_bottom,#1a3a2c_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#10221a]/70 border-b border-[#1a3a2c] px-6 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
  
        {/* Left Logo */}
        <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M5 3v18" />
                <path d="M5 4c5 0 5 2 10 2v8c-5 0-5-2-10-2" />
            </svg>
            </div>
        </div>

        {/* Center Title */}
        <div className="flex justify-center">
            <h2 className="text-3xl font-bold text-white">SolveOn</h2>
        </div>

        {/* Right Buttons */}
        <div className="flex justify-end items-center gap-4">
            <button
            onClick={() => navigate("/login")}
            className="text-sm font-semibold hover:text-emerald-400"
            >
            Sign In
            </button>

            <button
            onClick={() => navigate("/register")}
            className="bg-emerald-400 text-black px-5 py-2 rounded-lg font-bold hover:opacity-90"
            >
            Get Started
            </button>
        </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">

            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              Code. <span className="text-emerald-400">Solve.</span>
              <br />
              Conquer.
            </h1>

            <p className="text-lg text-slate-400 max-w-xl">
              Master coding through real-world challenges. Build logic, solve problems, and sharpen your skills on the ultimate developer platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-emerald-400 text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition"
              >
                Start Solving Now →
              </button>
            </div>
          </div>

          {/* Code Preview */}
          <div className="relative">
            <div className="rounded-2xl border border-[#1a3a2c] bg-[#10221a]/70 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="px-4 py-3 border-b border-[#1a3a2c] text-xs text-slate-500 font-mono">
                solver.ts — solveon-engine
              </div>

              <div className="p-6 font-mono text-sm space-y-3 min-h-[400px]">
                <p className="text-blue-400">
                  export async function solveChallenge(id: string) {"{"}
                </p>
                <p className="pl-4 text-slate-400">
                  const solution = await engine.execute(id);
                </p>
                <p className="pl-4 text-slate-400">if (solution.isOptimized) {"{"}</p>
                <p className="pl-8 text-emerald-400">return "CONQUERED";</p>
                <p className="pl-4 text-slate-400">{"}"}</p>
                <p className="text-blue-400">{"}"}</p>

                <div className="pt-8">
                  <div className="h-2 bg-[#1a3a2c] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-3/4" />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>Analyzing Architecture</span>
                    <span className="text-emerald-400">75% Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl font-black">Built for Competitive Coding</h2>
          <p className="text-slate-400 mt-4 max-w-2xl">
            Everything you need to bridge coding and engineering in one
            integrated ecosystem.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            "Real-world Infrastructure Problems",
            "Global Leaderboard",
            "Developer Dashboard",
          ].map((feature) => (
            <div
              key={feature}
              className="rounded-2xl border border-[#1a3a2c] bg-[#10221a]/70 p-8 hover:border-emerald-400/40 transition"
            >
              <h3 className="text-xl font-bold mb-3">{feature}</h3>
              <p className="text-slate-400 text-sm">
                Production-grade learning and engineering workflow.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto rounded-3xl border border-emerald-400/20 bg-[#10221a]/70 p-16 text-center">
          <h2 className="text-5xl font-black mb-6">
            Ready to level up your
            <br />
            <span className="text-emerald-400">Engineering Career?</span>
          </h2>

          <p className="text-slate-400 mb-10">
            Join SolveOn and start solving real-world engineering challenges.
          </p>

          <button
            onClick={() => navigate("/register")}
            className="bg-emerald-400 text-black px-10 py-4 rounded-2xl font-bold hover:scale-105 transition"
          >
            Join SolveOn 🚀
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#1a3a2c]">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-5 px-6">

            {/* Center Text */}
            <p className="text-3xl font-bold text-white text-center">
            Created with ❤️ by Komal Goel
            </p>

            {/* Icons Below */}
            <div className="flex items-center gap-4">
            <a
                href="https://github.com/KomalGoel18"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#10221a] border border-[#1a3a2c] flex items-center justify-center text-slate-400 hover:text-emerald-400 transition"
            >
                <Github className="w-5 h-5" />
            </a>

            <a
                href="https://www.linkedin.com/in/komal-goel-b9bb4a291/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#10221a] border border-[#1a3a2c] flex items-center justify-center text-slate-400 hover:text-emerald-400 transition"
            >
                <Linkedin className="w-5 h-5" />
            </a>

            <a
                href="https://komalgoel.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#10221a] border border-[#1a3a2c] flex items-center justify-center text-slate-400 hover:text-emerald-400 transition"
            >
                <Globe className="w-5 h-5" />
            </a>
            </div>
        </div>
        </footer>
    </div>
  );
}