import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Integrate with authentication service
    // eslint-disable-next-line no-console
    console.log("Login attempt", { email, password, rememberMe });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F4FD7] via-[#2F7FFE] to-[#45C1FF] px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 rounded-3xl bg-white/90 p-8 shadow-2xl shadow-blue-500/20 backdrop-blur">
        <div className="flex flex-col gap-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1F4FD7]/10 text-[#1F4FD7]">
            <span className="text-xl font-bold">eco</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Masuk ke Ecosera</h1>
          <p className="text-sm text-slate-500">
            Temukan produk lokal dan lanjutkan belanja dari seller favoritmu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="nama@ecosera.id"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#1F4FD7] focus:outline-none focus:ring-2 focus:ring-[#1F4FD7]/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Kata Sandi
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              placeholder="Minimal 8 karakter"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#1F4FD7] focus:outline-none focus:ring-2 focus:ring-[#1F4FD7]/20"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#1F4FD7] focus:ring-[#1F4FD7]"
              />
              Ingat saya
            </label>
            <button
              type="button"
              className="font-semibold text-[#1F4FD7] transition hover:text-[#163ea8]"
            >
              Lupa kata sandi?
            </button>
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-[#1F4FD7] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-[#1B44BD]"
          >
            Masuk
          </button>
        </form>

        <div className="text-center text-sm text-slate-600">
          Belum punya akun?{" "}
          <Link
            to="/sign-up"
            className="font-semibold text-[#1F4FD7] transition hover:text-[#163ea8]"
          >
            Daftar sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
