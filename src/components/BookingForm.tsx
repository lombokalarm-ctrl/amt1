import React, { useState } from "react";
import { UmrahPackage, Booking } from "../types";
import { Send, Users, CheckCircle, Smartphone, Calendar, MapPin, Loader2 } from "lucide-react";

interface BookingFormProps {
  packages: UmrahPackage[];
  selectedPrePackage?: UmrahPackage | null;
  onBookingSuccess: (booking: Booking) => void;
}

export default function BookingForm({ packages, selectedPrePackage, onBookingSuccess }: BookingFormProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCity, setSelectedCity] = useState("Mataram");
  const [packageId, setPackageId] = useState(selectedPrePackage?.id || packages[0]?.id || "");
  const [passengersCount, setPassengersCount] = useState<number>(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<Booking | null>(null);

  React.useEffect(() => {
    if (selectedPrePackage?.id) {
      setPackageId(selectedPrePackage.id);
    } else if (!packageId && packages[0]?.id) {
      setPackageId(packages[0].id);
    }
  }, [selectedPrePackage, packages]);

  const lombokCities = [
    "Mataram",
    "Lombok Barat (Gerung, Narmada, Kediri)",
    "Lombok Tengah (Praya, Kopang, Jonggat)",
    "Lombok Timur (Selong, Masbagik, Aikmel)",
    "Sumbawa Besar",
    "Sumbawa Barat (KSB, Poto Tano)",
    "Bima (Kota & Kabupaten)",
    "Dompu"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    setLoading(true);
    const selectedPkg = packages.find(p => p.id === packageId);
    
    const payload = {
      fullName,
      phone,
      city: selectedCity,
      packageId,
      packageName: selectedPkg ? selectedPkg.title : "Paket Pilihan",
      passengersCount: Number(passengersCount),
      notes
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const resData = await response.json();
        setSuccess(resData.booking);
        onBookingSuccess(resData.booking);
        
        // Reset
        setFullName("");
        setPhone("");
        setNotes("");
        setPassengersCount(1);
      }
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedPkgDetails = packages.find(p => p.id === packageId);

  return (
    <section id="booking" className="py-20 bg-gradient-to-b from-white to-emerald-50/25 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Module Title */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <span className="text-emerald-700 font-bold uppercase tracking-widest text-xs block">Formulir Pemesanan Sederhana</span>
          <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight sm:text-4xl italic">
            Booking Seat Umroh Online
          </h2>
          <div className="w-16 h-1 bg-emerald-600 mx-auto rounded-full"></div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Amankan kuota keberangkatan Anda hari ini tanpa biaya penalti pendaftaran awal. Petugas representatif Amantubillahi akan segera menghubungi Anda dalam waktu 1x24 jam untuk verifikasi berkas passport & koper.
          </p>
        </div>

        {/* Dynamic Success Dialog */}
        {success ? (
          <div className="bg-emerald-50 border border-emerald-400 p-8 rounded-3xl text-center space-y-6 animate-fade-in shadow-lg">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-emerald-950 font-sans">Alhamdulillah, Booking Berhasil!</h3>
              <p className="text-sm text-emerald-800 leading-relaxed max-w-lg mx-auto">
                Terima kasih <strong>{success.fullName}</strong>. Tiket registrasi sementara Anda telah tercatat pada statistik antrean dengan ID <strong>{success.id}</strong>.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-emerald-100 text-left space-y-3 max-w-md mx-auto text-sm shadow-sm">
              <p>📌 <strong>Paket Terpilih:</strong> {success.packageName}</p>
              <p>👥 <strong>Jumlah Calon Jamaah:</strong> {success.passengersCount} Orang</p>
              <p>📍 <strong>Domisili Wilayah:</strong> {success.city}</p>
              <p>📞 <strong>No WhatsApp Terdaftar:</strong> {success.phone}</p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={`https://wa.me/6281917711234?text=Assalamu%27alaikum%20saya%20sudah%20melakukan%20booking%20seat%20online%20Amantubillahi%20dengan%20ID%20${success.id}.%20Lalu%20bagaimana%20langkah%20selanjutnya?`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm text-center"
              >
                Konfirmasi Via WhatsApp
              </a>
              <button
                onClick={() => setSuccess(null)}
                className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold rounded-xl text-xs sm:text-sm text-center"
              >
                Buat Booking Baru
              </button>
            </div>
          </div>
        ) : (
          <form 
            onSubmit={handleSubmit}
            className="bg-white border border-gray-100 p-8 sm:p-12 rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden"
          >
            {/* Soft background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/30 rounded-full blur-2xl pointer-events-none"></div>

            {/* Column 1: Personal Inputs */}
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                Informasi Calon Jamaah
              </h3>
              
              {/* Full Name input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap Sesuai KTP/Paspor</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Haji Lalu Sudirman"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-3 pr-3 py-3 border border-gray-300 rounded-xl text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-gray-900"
                  />
                </div>
              </div>

              {/* Phone input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Nomor HP / WhatsApp Aktif</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-xs font-bold text-gray-400 font-mono">+62</span>
                  <input
                    type="tel"
                    required
                    placeholder="8191234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-3 py-3 border border-gray-300 rounded-xl text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-gray-900 font-mono"
                  />
                </div>
              </div>

              {/* Resident City selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Domisili Kota / Kabupaten</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-gray-900 bg-white"
                >
                  {lombokCities.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Passenger count */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Calon Jamaah Berangkat</label>
                <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-300 max-w-[150px]">
                  <button
                    type="button"
                    onClick={() => setPassengersCount(Math.max(1, passengersCount - 1))}
                    className="px-3.5 py-2.5 text-sm font-extrabold text-gray-500 hover:text-emerald-700"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-gray-900 text-sm">{passengersCount}</span>
                  <button
                    type="button"
                    onClick={() => setPassengersCount(passengersCount + 1)}
                    className="px-3.5 py-2.5 text-sm font-extrabold text-gray-500 hover:text-emerald-700"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Column 2: Selection details */}
            <div className="space-y-5 flex flex-col justify-between">
              
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Paket & Catatan Khusus
                </h3>
                
                {/* Package select list */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Pilih Paket Keberangkatan</label>
                  <select
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-gray-900 bg-white"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.title} ({pkg.duration})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Live Preview pricing details */}
                {selectedPkgDetails && (
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-1.5 text-xs text-emerald-950 shadow-inner">
                    <p className="font-bold flex items-center justify-between text-emerald-900">
                      <span>Estimasi Biaya Paket:</span>
                      <span className="font-mono text-sm sm:text-base font-extrabold text-emerald-800">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(selectedPkgDetails.price * passengersCount)}
                      </span>
                    </p>
                    <p className="text-emerald-700">Akomodasi: Hotel Bintang {selectedPkgDetails.hotelStars} di Makkah & Madinah ({selectedPkgDetails.hotelMakkah})</p>
                    <p className="text-emerald-600 font-medium">🛫 Pesawat: {selectedPkgDetails.flights}</p>
                  </div>
                )}

                {/* Additional notes textarea */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Catatan Tambahan (Opsional Kamar/Katering)</label>
                  <textarea
                    placeholder="Contoh: Butuh penambahan kursi roda bagi orang tua, atau request menu vegetarian khusus"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl text-xs sm:text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none text-gray-900"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-800 hover:bg-emerald-950 text-white font-bold rounded-xl text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Mencatat Registrasi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Konfirmasi Booking Online Sekarang</span>
                  </>
                )}
              </button>

            </div>

          </form>
        )}

      </div>
    </section>
  );
}

