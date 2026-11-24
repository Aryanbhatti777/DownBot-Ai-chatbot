import { ArrowRight, Check, CircleHelp, LockKeyhole, Sparkles, WandSparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useState } from "react";

const models = [
  { name: "ChatGPT", color: "bg-emerald-500" },
  { name: "Claude", color: "bg-orange-400" },
  { name: "Gemini", color: "bg-blue-500" }
];

export default function AuthPage({ mode }) {
  const auth = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    const fields = isRegister ? { name, email, password } : { email, password };
    await auth[mode](fields);
  }

  if (!auth.ready) {
    return <main className="grid min-h-screen place-items-center text-sm text-stone-500">Getting your space ready…</main>;
  }

  if (auth.user) {
    return (
      <main className="min-h-screen bg-[#f6f7f5] px-6 py-8">
        <header className="mx-auto flex max-w-6xl items-center justify-between">
          <Brand />
          <button onClick={auth.logout} className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-white">Sign out</button>
        </header>
        <section className="mx-auto mt-28 max-w-2xl text-center">
          <div className="mx-auto mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-[#e8eee8] text-[#456b54]"><Sparkles size={24} /></div>
          <p className="text-sm font-medium text-stone-500">YOUR SPACE IS READY</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">Welcome, {auth.user.name.split(" ")[0]}.</h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-stone-500">Downbot brings your favorite AI models together. Your account is ready for what comes next.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {models.map((model) => <span key={model.name} className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/70"><span className={`h-2 w-2 rounded-full ${model.color}`} />{model.name}</span>)}
          </div>
          <Link to="/conversation" className="mt-10 inline-flex items-center gap-2 rounded-xl bg-[#263c2e] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#344e3d]">
            Start a conversation <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f5] text-stone-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7 sm:px-10">
        <Brand />
        <a href="mailto:hello@downbot.ai" className="flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"><CircleHelp size={17} /> <span className="hidden sm:inline">Need help?</span></a>
      </header>

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 pb-16 pt-10 sm:px-10 lg:grid-cols-[1fr_420px] lg:gap-24 lg:pb-24 lg:pt-14">
        <section className="max-w-xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#dce4dc] bg-white/70 px-3.5 py-2 text-xs font-medium text-[#557460]">
            <WandSparkles size={14} /> ONE SPACE. MANY POSSIBILITIES.
          </div>
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl">A little more<br />room to <span className="text-[#668570]">think.</span></h1>
          <p className="mt-6 max-w-md text-base leading-7 text-stone-500 sm:text-lg sm:leading-8">Your favorite AI, all in one calm place. Pick up where inspiration takes you.</p>
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {models.map((model) => <span key={model.name} className={`grid h-9 w-9 place-items-center rounded-full border-[3px] border-[#f6f7f5] ${model.color} text-[10px] font-semibold text-white`}>{model.name.slice(0, 1)}</span>)}
            </div>
            <p className="text-sm text-stone-500">ChatGPT, Claude, Gemini <span className="text-stone-400">and more</span></p>
          </div>
          <div className="mt-12 hidden space-y-4 sm:block">
            {["One account for your AI workspace", "Your conversations, always within reach"].map((item) => <p key={item} className="flex items-center gap-2.5 text-sm text-stone-500"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#e5ece5] text-[#57725f]"><Check size={12} /></span>{item}</p>)}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-stone-200/80 bg-white p-7 shadow-[0_24px_70px_-45px_rgba(28,38,30,0.28)] sm:p-9">
          <div className="mb-8">
            <div className="mb-6 grid h-11 w-11 place-items-center rounded-[14px] bg-[#edf2ed] text-[#587260]"><LockKeyhole size={19} /></div>
            <h2 className="text-2xl font-semibold tracking-tight">{isRegister ? "Create your account" : "Welcome back"}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">{isRegister ? "Start making space for better ideas." : "Sign in to pick up where you left off."}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && <Field label="Your name" type="text" autoComplete="name" value={name} onChange={setName} placeholder="Alex Morgan" />}
            <Field label="Email address" type="email" autoComplete="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <Field label="Password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={setPassword} placeholder={isRegister ? "At least 8 characters" : "Enter your password"} />
            {auth.error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700">{auth.error}</p>}
            <button disabled={auth.loading} className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#263c2e] px-4 py-3.5 text-sm font-medium text-white transition hover:bg-[#344e3d] disabled:cursor-not-allowed disabled:opacity-60">
              {auth.loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
              {!auth.loading && <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-stone-500">
            {isRegister ? "Already have an account?" : "New to Downbot?"}{" "}
            <Link to={isRegister ? "/login" : "/register"} className="font-medium text-[#496451] hover:text-[#263c2e]">
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <p className="mt-7 border-t border-stone-100 pt-5 text-center text-xs leading-5 text-stone-400">By continuing, you agree to our <a className="underline underline-offset-2 hover:text-stone-600" href="mailto:hello@downbot.ai?subject=Terms">Terms</a> and <a className="underline underline-offset-2 hover:text-stone-600" href="mailto:hello@downbot.ai?subject=Privacy">Privacy Policy</a>.</p>
        </section>
      </div>
    </main>
  );
}

function Brand() {
  return <Link to="/login" className="flex items-center gap-2.5" aria-label="Downbot home"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#263c2e] text-white"><Sparkles size={17} /></span><span className="text-lg font-semibold tracking-tight">downbot</span></Link>;
}

function Field({ label, type, autoComplete, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-700">{label}</span>
      <input required type={type} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} minLength={type === "password" ? 8 : undefined} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-[#73917b] focus:ring-4 focus:ring-[#eaf0eb]" />
    </label>
  );
}
