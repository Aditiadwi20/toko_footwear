import React from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  ShieldCheck,
  CreditCard,
  Truck
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-primary text-[#b5b5b5] mt-24 border-t border-[#2d2e2c] font-sans">
      {/* Top Banner: Trust Badges */}
      <div className="border-b border-[#2d2e2c] bg-neutral-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-secondary/15 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-brand-secondary" />
            </div>
            <div>
              <p className="text-white text-xs font-bold tracking-tight">Kualitas Premium Asli &amp; Bergaransi</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-300">
            <div className="flex items-center gap-1.55">
              <Truck className="w-4 h-4 text-brand-accent shrink-0" />
              <span>Gratis Ongkir Se-Indonesia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-brand-secondary shrink-0" />
              <span>Pembayaran Aman &amp; Terverifikasi</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-[#2d2e2c]">
          
          {/* Column 1: Brand details & Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg tracking-tight">
              <div className="w-6 h-6 rounded bg-brand-secondary flex items-center justify-center font-black text-xs">
                F
              </div>
              <span>Toko Footwear</span>
            </div>
            <p className="text-xs leading-relaxed max-w-md text-neutral-400">
              Destinasi belanja footwear premium terpercaya dengan kurasi sepatu berkualitas tinggi untuk kenyamanan dan gaya melangkah terbaik Anda.
            </p>
            <div className="flex gap-2.5 text-xs text-neutral-400 pt-1">
              <MapPin className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Gedung Footwear Utama, Lantai 3-4, Jl. Jend. Sudirman No. 120, Menteng, DKI Jakarta 10310.
              </p>
            </div>
          </div>

          {/* Column 2: Kontak & Layanan Pelanggan */}
          <div className="space-y-4 md:pl-8">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-2 border-brand-secondary pl-2">Hubungi Kami</h4>
            <div className="space-y-2.5 text-xs text-neutral-400">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-secondary shrink-0" />
                <span>+62 812-3456-7890 (WhatsApp Customer Service)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-secondary shrink-0" />
                <span>support@tokofootwear.id</span>
              </div>
              <div className="flex items-center gap-2.5 pt-1 border-t border-[#2d2e2c]/65">
                <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>Setiap Hari: 09.00 - 21.00 WIB</span>
              </div>
            </div>
          </div>

        </div>
        
        {/* Footer bottom */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <p>© 2026 PT Toko Footwear Indonesia. Segenap Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex gap-2 items-center text-[10px] font-mono">
            <span className="px-1.5 py-0.5 bg-[#242523] rounded-sm text-neutral-400">GOPAY</span>
            <span className="px-1.5 py-0.5 bg-[#242523] rounded-sm text-neutral-400">OVO</span>
            <span className="px-1.5 py-0.5 bg-[#242523] rounded-sm text-neutral-400">VISA</span>
            <span className="px-1.5 py-0.5 bg-[#242523] rounded-sm text-neutral-400">MASTERCARD</span>
            <span className="px-1.5 py-0.5 bg-[#242523] rounded-sm text-neutral-400">BCA VA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
