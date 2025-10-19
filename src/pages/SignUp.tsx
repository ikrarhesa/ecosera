import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!agreeTerms) return;

    // TODO: Integrate with sign-up service
    // eslint-disable-next-line no-console
    console.log("Sign up attempt", { name, email, phone, password, agreeTerms });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F4FD7] via-[#2F7FFE] to-[#45C1FF] px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 rounded-3xl bg-white/90 p-8 shadow-2xl shadow-blue-500/20 backdrop-blur">
        <div className="flex flex-col gap-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1F4FD7]/10 text-[#1F4FD7]">
            <span className="text-xl font-bold">eco</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Buat akun Ecosera</h1>
          <p className="text-sm text-slate-500">
            Dukung UMKM lokal dan nikmati pengalaman belanja yang terkurasi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              Nama Lengkap
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="Nama sesuai KTP"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#1F4FD7] focus:outline-none focus:ring-2 focus:ring-[#1F4FD7]/20"
            />
          </div>

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
            <label htmlFor="phone" className="text-sm font-medium text-slate-700">
              Nomor WhatsApp
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              placeholder="08xxxxxxxxxx"
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
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#1F4FD7] focus:outline-none focus:ring-2 focus:ring-[#1F4FD7]/20"
            />
          </div>

          <label className="flex items-start gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(event) => setAgreeTerms(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1F4FD7] focus:ring-[#1F4FD7]"
            />
            <span>
              Saya setuju dengan{" "}
              <button type="button" className="font-semibold text-[#1F4FD7] underline underline-offset-2">
                Syarat & Ketentuan
              </button>{" "}
              Ecosera.
            </span>
          </label>

          <button
            type="submit"
            disabled={!agreeTerms}
            className="inline-flex items-center justify-center rounded-full bg-[#1F4FD7] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-[#1B44BD] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            Buat akun
          </button>
        </form>

        <div className="text-center text-sm text-slate-600">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#1F4FD7] transition hover:text-[#163ea8]"
          >
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
