import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-neutral-800 selection:bg-brand-primary selection:text-white overflow-x-hidden">
      {/* Navigation / Header - Navy background to make white logo visible */}
      <nav className="sticky top-0 w-full z-50 bg-brand-navy backdrop-blur-md border-b border-white/10 py-4 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <Link to="/landing" className="inline-block transition-transform hover:scale-105">
            <img src="/images/ecosera-logo.svg" alt="Ecosera Logo" className="h-8 w-auto" />
          </Link>
        </div>
      </nav>

      {/* Section 1: Minimal Hero (The Hook) */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 md:px-8">
        {/* Subtle background texture/image behind text */}
        <div className="absolute inset-0 z-0 opacity-10">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Rice_terraces%2C_Bali.jpg"
            alt="Tegalalang Rice Terraces"
            className="w-full h-full object-cover grayscale"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center mt-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-neutral-500 mb-8"
          >
            Cerita Kami
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-merriweather text-neutral-800 leading-[1.3] max-w-4xl mx-auto"
          >
            "Banyak produk lokal berhenti di tempat asalnya. Bukan karena kurang bernilai, tapi karena tidak ada jalannya."
          </motion.h1>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 flex flex-col items-center gap-2 text-neutral-400"
        >
          <span className="text-xs uppercase tracking-widest">Scroll to read</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-12 bg-gradient-to-b from-neutral-400 to-transparent"
          />
        </motion.div>
      </section>

      {/* Section 2: The Core Narrative (Editorial Text with Images) */}
      <section className="py-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Grid Layout for Desktop, Stacked for Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-8 text-lg sm:text-xl text-neutral-700 leading-relaxed font-light lg:max-w-xl"
            >
              <p>
                Di banyak wilayah Indonesia, kehidupan bertumbuh dari tanah yang subur, tangan-tangan yang terampil, dan tradisi yang diwariskan dengan tekun. Ada petani yang merawat hasil bumi dengan ketekunan, ada perajin yang menjaga mutu karyanya, dan keluarga kecil yang menghasilkan produk lokal bernilai.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative aspect-[4/5] lg:aspect-square rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/8/8e/Gianyar-Regency_Bali_Indonesia_A-rice-farmer-working-in-his-paddy-01.jpg"
                alt="Petani Indonesia"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Full width immersive image break */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="w-full h-[40vh] md:h-[60vh] rounded-2xl overflow-hidden mb-24 shadow-xl relative"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Mount_Bromo_closeup_on_sunrise.jpg"
              alt="Pemandangan Bromo"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Centered Narrow Column for continued text */}
          <div className="max-w-3xl mx-auto space-y-8 text-lg sm:text-xl text-neutral-700 leading-relaxed font-light text-center md:text-left">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              Namun, nilai itu kerap berhenti di tempat asalnya. Bukan karena kualitas mereka tidak memadai, dan bukan karena mereka tak punya semangat. Persoalannya sederhana: akses menuju pasar yang lebih luas belum terbuka. Banyak yang akhirnya hanya menjual ke lingkungan terdekat atau melalui pesan WhatsApp sederhana. Potensinya ada, tetapi pintunya belum tersedia.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Section 3: The Pull-Quote Break - Navy Background */}
      <section className="relative py-32 px-4 md:px-8 bg-brand-navy text-[#F9F8F6] overflow-hidden">
        {/* Parallax Background overlay */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/36/Batik_pattern_-_garuda.jpg"
            alt="Tekstur Batik"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.blockquote
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-merriweather leading-[1.5] italic font-light"
          >
            "Di sisi lain, ada daerah yang bertumpu pada satu sumber daya alam. Ketika sektor itu meredup, masa depan daerah menjadi rapuh. Mereka butuh ekonomi baru yang lebih tangguh."
          </motion.blockquote>
        </div>
      </section>

      {/* Section 4: The Solution (Continuing the Story) */}
      <section className="py-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

            {/* Image Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5 relative space-y-8"
            >
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/8/86/Intergenerational_Batik_Making_in_Trusmi_Cirebon_-_Mother_and_Daughter_Practicing_Batik_Tulis.jpg"
                  alt="Pembuatan Batik Tradisional"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hidden md:block">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/Jukung_Pasar_Terapung.jpg"
                  alt="Pasar Terapung"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Text Column */}
            <div className="lg:col-span-7 space-y-10 text-lg sm:text-xl text-neutral-700 leading-relaxed font-light lg:pt-12">
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                Di titik inilah Ecosera mengambil peran. Ecosera lahir dari keyakinan bahwa daerah-daerah di Indonesia memiliki nilai yang layak dikenal lebih luas. Yang dibutuhkan adalah jembatan yang menghubungkan apa yang telah dimiliki masyarakat dengan peluang yang selama ini terasa jauh.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                Melalui Ecosera, hasil pertanian, kerajinan, makanan olahan, dan berbagai karya daerah dapat ditemukan oleh lebih banyak orang. Oleh pembeli yang mencari kualitas autentik, oleh wisatawan yang menginginkan buah tangan terbaik, dan oleh masyarakat yang ingin mendukung ekonomi lokal.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-normal text-neutral-800"
              >
                Kami tidak datang untuk memutus cara lama. Kami menguatkan dan membantu penjual yang mulai dari pesanan kecil tumbuh menjadi pasar yang mapan dengan martabat. Ecosera adalah upaya memastikan masyarakat di daerah tertinggal memiliki kesempatan yang sama.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: The Closing Statement & CTA - Navy Background */}
      <section className="py-24 px-4 md:px-8 bg-brand-navy border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-merriweather text-white leading-relaxed"
          >
            Itulah Ecosera: sebuah jembatan bagi produk lokal, bagi harapan yang terus bertumbuh, dan bagi ekonomi yang lebih tangguh.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
          >
            <Link
              to="/etalase"
              className="w-full sm:w-auto bg-white text-brand-navy px-10 py-4 rounded-full font-semibold text-lg hover:bg-neutral-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center"
            >
              Lihat Produk Lokal
            </Link>
            <Link
              to="/landing"
              className="w-full sm:w-auto bg-transparent border-2 border-white/30 text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-brand-navy transition-all flex items-center justify-center"
            >
              Kembali ke Beranda
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section 6: Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Left */}
            <div className="space-y-4 text-center md:text-left">
              <Link to="/landing" className="inline-block">
                {/* Logo in footer - likely needs dark bg if it's white, but keeping white for now as per landing */}
                <img src="/images/ecosera-logo.svg" alt="Ecosera Logo" className="h-8 w-auto mx-auto md:mx-0 opacity-20 hover:opacity-100 transition-opacity" />
              </Link>
              <p className="text-slate-500 max-w-xs mx-auto md:mx-0">
                Ekonomi Digital untuk Semua
              </p>
            </div>

            {/* Middle */}
            <div className="text-center md:text-left">
              <h4 className="font-bold text-neutral-800 mb-4">Tautan</h4>
              <ul className="space-y-3">
                <li><Link to="/etalase" className="text-slate-500 hover:text-brand-primary transition-colors">Katalog</Link></li>
                <li><Link to="/about" className="text-slate-500 hover:text-brand-primary transition-colors">Tentang Kami</Link></li>
                <li><Link to="/terms" className="text-slate-500 hover:text-brand-primary transition-colors">Syarat & Ketentuan</Link></li>
              </ul>
            </div>

            {/* Right */}
            <div className="text-center md:text-left">
              <h4 className="font-bold text-neutral-800 mb-4">Kontak</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-500 hover:text-brand-primary transition-colors">WhatsApp Kami</a></li>
                <li><a href="#" className="text-slate-500 hover:text-brand-primary transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
            <p className="text-sm text-slate-400 w-full">
              © 2026 Ecosera. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
