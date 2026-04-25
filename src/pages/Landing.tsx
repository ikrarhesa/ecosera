import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Storefront, Leaf, Handshake, Heart, Lightbulb, Package, ShoppingCart } from "@phosphor-icons/react";

export default function Landing() {

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-brand-primary selection:text-white">
      {/* Section 1: Navigation (Navbar) */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-brand-primary/90 to-blue-500/90 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Left: Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/landing" className="flex items-center gap-2">
                <img src="/images/ecosera-logo.svg" alt="Ecosera Logo" className="h-8 w-auto" />
              </Link>
            </div>

            {/* Center: Links (Hidden on Mobile) */}
            <div className="hidden md:flex space-x-8">
              <Link to="/landing" className="text-white/80 hover:text-white font-medium transition-colors">Beranda</Link>
              <Link to="/etalase" className="text-white/80 hover:text-white font-medium transition-colors">Katalog</Link>
              <Link to="/about" className="text-white/80 hover:text-white font-medium transition-colors">Tentang Kami</Link>
            </div>

            {/* Right: CTA */}
            <div className="flex items-center">
              <Link
                to="/etalase"
                className="bg-white text-brand-navy px-5 py-2.5 rounded-full font-bold hover:bg-slate-100 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Mulai Belanja
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Section 2: Hero Section (Split Layout) */}
      <section className="relative pt-20 pb-24 overflow-hidden bg-slate-50/50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left Content */}
            <div className="text-left z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-6 inline-flex"
              >
                <span className="py-1.5 px-4 rounded-full bg-white/80 backdrop-blur-md border border-brand-primary/20 text-brand-primary text-sm font-bold tracking-wide shadow-sm flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                  </span>
                  Membangun Ekonomi Mandiri
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-brand-navy tracking-tight leading-[1.1] mb-8"
              >
                Menghubungkan <span className="text-brand-primary relative whitespace-nowrap">
                  Nilai Lokal
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg>
                </span> <br className="hidden lg:block" />
                dengan Peluang <br className="hidden lg:block" /> yang Lebih Luas.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl leading-relaxed"
              >
                Di banyak wilayah Indonesia, kehidupan bertumbuh dari tangan-tangan terampil dan hasil bumi yang berharga. Ecosera hadir untuk membukakan jalan agar produk lokal tidak hanya berhenti di tempat asalnya, tapi menjangkau pasar yang lebih adil.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.45 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <Link
                  to="/etalase"
                  className="w-full sm:w-auto bg-brand-primary text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-brand-primary/90 transition-all hover:shadow-[0_8px_30px_rgb(34,84,197,0.3)] hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Jelajahi Produk Lokal
                </Link>
                <Link
                  to="/about"
                  className="w-full sm:w-auto bg-white border border-slate-200 text-brand-navy px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-50 transition-all hover:shadow-sm flex items-center justify-center gap-2 group"
                >
                  Baca Cerita Kami
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-brand-primary" />
                </Link>
              </motion.div>
            </div>

            {/* Right Content: Image Composition */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="relative h-[400px] sm:h-[500px] lg:h-[600px] w-full max-w-md mx-auto lg:max-w-none mt-12 lg:mt-0"
            >
              {/* Main Background Image (Tall) */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 lg:top-4 lg:right-4 w-[75%] lg:w-[380px] h-[320px] sm:h-[420px] lg:h-[520px] rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl border-4 lg:border-[6px] border-white z-10"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/8/8e/Gianyar-Regency_Bali_Indonesia_A-rice-farmer-working-in-his-paddy-01.jpg" alt="Petani Bali" className="w-full h-full object-cover" />
              </motion.div>

              {/* Overlapping Foreground Image (Square) */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-0 left-0 lg:bottom-4 lg:left-0 w-[60%] lg:w-[300px] aspect-square lg:h-[300px] rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl border-4 lg:border-[6px] border-white z-20"
              >
                <img src="https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=80" alt="Produk Rempah" className="w-full h-full object-cover" />
              </motion.div>

              {/* Floating Glassmorphism Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="absolute -top-4 -left-2 sm:-left-6 lg:top-24 lg:-left-12 bg-white/90 backdrop-blur-xl p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-white z-30 flex items-center gap-3 sm:gap-4 scale-90 sm:scale-100 origin-top-left"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center text-emerald-600">
                  <Leaf weight="duotone" className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-brand-navy leading-none">50+</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-500">UMKM Tergabung</p>
                </div>
              </motion.div>

              {/* Decorative dots */}
              <div className="absolute -bottom-4 -right-4 lg:-bottom-6 lg:-right-6 w-24 h-24 lg:w-32 lg:h-32 bg-[radial-gradient(#2254c5_2px,transparent_2px)] [background-size:16px_16px] opacity-20 z-0"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3: The "Why" (Feature Cards) */}
      <section className="py-24 relative overflow-hidden">
        {/* Subtle Blue Gradient Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#f8faff] via-[#e6f0ff] to-[#f0f5ff]">
          {/* Subtle Ambient Glows for Depth */}
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-200/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-sm tracking-wide mb-6"
            >
              <Heart weight="fill" className="w-4 h-4" /> Visi & Misi
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold text-brand-navy tracking-tight"
            >
              Mengapa Ecosera Hadir?
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative overflow-hidden p-10 rounded-[2.5rem] bg-white/95 backdrop-blur-md border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgb(34,84,197,0.12)] hover:-translate-y-2 transition-all duration-500 group"
            >
              {/* Watermark Icon */}
              <Storefront weight="fill" className="absolute -right-8 -bottom-8 w-56 h-56 text-slate-50 group-hover:text-brand-primary/[0.03] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-50 text-brand-primary rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-colors duration-500">
                  <Storefront weight="duotone" className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-brand-navy mb-4">Akses Pasar Nyata</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Banyak produk lokal berkualitas yang tidak memiliki akses pasar. Kami membukakan pintunya, mulai dari komunitas terdekat hingga pembeli yang lebih luas.
                </p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
              className="relative overflow-hidden p-10 rounded-[2.5rem] bg-white/95 backdrop-blur-md border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgb(16,185,129,0.12)] hover:-translate-y-2 transition-all duration-500 group"
            >
              <Leaf weight="fill" className="absolute -right-8 -bottom-8 w-56 h-56 text-slate-50 group-hover:text-emerald-500/[0.03] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-500">
                  <Leaf weight="duotone" className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-brand-navy mb-4">Transisi Ekonomi</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Membantu daerah yang bergantung pada satu sumber daya (seperti tambang) untuk membangun ekonomi baru yang mandiri dan berkelanjutan.
                </p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
              className="relative overflow-hidden p-10 rounded-[2.5rem] bg-white/95 backdrop-blur-md border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgb(245,158,11,0.12)] hover:-translate-y-2 transition-all duration-500 group"
            >
              <Handshake weight="fill" className="absolute -right-8 -bottom-8 w-56 h-56 text-slate-50 group-hover:text-amber-500/[0.03] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-colors duration-500">
                  <Handshake weight="duotone" className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-brand-navy mb-4">Perdagangan Adil</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Memotong jarak antara pembuat dan pembeli. Menjadikan perdagangan lebih transparan dan memberdayakan komunitas langsung.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section className="py-24 bg-slate-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-sm tracking-wide mb-6"
            >
              <Lightbulb weight="fill" className="w-4 h-4" /> Cara Kerja
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-poppins font-bold text-brand-navy tracking-tight"
            >
              Bagaimana Ecosera Bekerja?
            </motion.h2>
          </div>

          <div className="space-y-32">
            {/* Row 1: Seller */}
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="lg:w-1/2 space-y-8"
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-brand-primary font-semibold text-sm tracking-wide">
                  <Storefront weight="bold" className="w-4 h-4" /> Untuk Pembuat (Seller)
                </span>
                <h3 className="text-3xl md:text-4xl font-poppins font-bold text-brand-navy leading-tight">
                  Mulai dari Langkah Sederhana.
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Tidak perlu sistem yang rumit. Penjual di daerah bisa mulai menawarkan produknya dengan cara yang sudah mereka kenal, seperti WhatsApp. Ecosera membantu merapikan katalog dan menghubungkannya dengan pembeli yang tepat.
                </p>
                <div className="flex items-center gap-4 text-brand-navy font-semibold">
                  <div className="w-12 h-12 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center">
                    <span className="text-xl">1</span>
                  </div>
                  <span>Daftar via WhatsApp</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="lg:w-1/2 w-full relative"
              >
                <div className="relative aspect-[4/3] rounded-[2.5rem] shadow-[0_20px_50px_rgb(0,0,0,0.1)] overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&q=80" alt="Penjual UMKM" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-transparent opacity-60"></div>
                </div>
                {/* Floating Element */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 sm:gap-4 scale-90 sm:scale-100 origin-bottom-left"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center">
                    <Package weight="duotone" className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-navy text-sm sm:text-base">Katalog Rapi</p>
                    <p className="text-xs sm:text-sm text-slate-500">Siap Jual</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Row 2: Buyer */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="lg:w-1/2 space-y-8"
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold text-sm tracking-wide">
                  <ShoppingCart weight="bold" className="w-4 h-4" /> Untuk Pembeli (Buyer)
                </span>
                <h3 className="text-3xl md:text-4xl font-poppins font-bold text-brand-navy leading-tight">
                  Temukan Karya & Rasa Autentik.
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Mencari oleh-oleh khas langsung dari perajinnya? Atau hasil panen segar dari petani lokal? Ecosera memudahkan Anda menemukan dan mendukung mereka secara langsung tanpa perantara yang panjang.
                </p>
                <div className="flex items-center gap-4 text-brand-navy font-semibold">
                  <div className="w-12 h-12 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center">
                    <span className="text-xl">2</span>
                  </div>
                  <span>Dukung UMKM Lokal</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="lg:w-1/2 w-full relative"
              >
                <div className="relative aspect-[4/3] rounded-[2.5rem] shadow-[0_20px_50px_rgb(0,0,0,0.1)] overflow-hidden group">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/8/86/Intergenerational_Batik_Making_in_Trusmi_Cirebon_-_Mother_and_Daughter_Practicing_Batik_Tulis.jpg" alt="Produk Autentik" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-transparent opacity-60"></div>
                </div>
                {/* Floating Element */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 sm:gap-4 scale-90 sm:scale-100 origin-bottom-right"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Heart weight="duotone" className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-navy text-sm sm:text-base">Produk Asli</p>
                    <p className="text-xs sm:text-sm text-slate-500">Terpercaya</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Highlight / Quote */}
      <section className="py-24 bg-brand-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-2xl md:text-4xl leading-relaxed text-white font-merriweather font-normal italic mb-12">
            "Ecosera bukan hanya tentang pasar digital. Ini tentang memastikan orang yang menanam makanan kita dan menjaga tradisi kita, akhirnya mendapat kesempatan yang adil."
          </blockquote>
          <Link
            to="/about"
            className="inline-block bg-transparent border-2 border-white/30 text-white px-8 py-3.5 rounded-full font-semibold text-lg hover:bg-white hover:text-brand-navy transition-all"
          >
            Pelajari Visi Kami
          </Link>
        </div>
      </section>

      {/* Section 6: Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Left */}
            <div className="space-y-4">
              <Link to="/landing" className="inline-block">
                <img src="/images/ecosera-logo.svg" alt="Ecosera Logo" className="h-8 w-auto" />
              </Link>
              <p className="text-slate-500">
                Produk Lokal. Akses Nyata. Ekonomi yang Adil.
              </p>
            </div>

            {/* Middle */}
            <div>
              <h4 className="font-bold text-brand-navy mb-4">Tautan</h4>
              <ul className="space-y-3">
                <li><Link to="/etalase" className="text-slate-500 hover:text-brand-primary transition-colors">Katalog</Link></li>
                <li><Link to="/about" className="text-slate-500 hover:text-brand-primary transition-colors">Tentang Kami</Link></li>
                <li><Link to="/terms" className="text-slate-500 hover:text-brand-primary transition-colors">Syarat & Ketentuan</Link></li>
              </ul>
            </div>

            {/* Right */}
            <div>
              <h4 className="font-bold text-brand-navy mb-4">Kontak</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-500 hover:text-brand-primary transition-colors">WhatsApp Kami</a></li>
                <li><a href="#" className="text-slate-500 hover:text-brand-primary transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-slate-400">
              © 2026 Ecosera. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
