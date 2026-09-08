import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import {
    Video,
    CheckCircle2,
    SwitchCamera,
    Zap,
    Maximize,
    ScanLine,
    ArrowLeft,
    Info,
    CalendarCheck,
    MapPin,
    BookOpen,
    LayoutGrid,
    QrCode,
    AlertTriangle,
    CalendarX,
    VideoOff,
    Check,
} from 'lucide-react';
import api from '../../Lib/axios';

const SCANNER_ELEMENT_ID = 'qr-reader';

export default function Scan() {
    const scannerRef = useRef(null);
    const [status, setStatus] = useState('scanning'); // scanning | loading | success | error
    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (status !== 'scanning') {
            return;
        }

        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = scanner;
        let hasStopped = false;

        const safeStop = async () => {
            if (hasStopped) {
                return;
            }
            hasStopped = true;
            try {
                await scanner.stop();
            } catch (err) {
                // Kamera memang sudah berhenti/belum sempat jalan, aman diabaikan.
            }
        };

        scanner
            .start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    safeStop().then(() => submitScan(decodedText));
                },
                () => {}
            )
            .catch(() => {
                setStatus('error');
                setErrorMessage('Tidak bisa mengakses kamera. Pastikan kamu memberikan izin kamera di browser.');
            });

        return () => {
            safeStop();
        };
    }, [status]);

    const submitScan = async (token) => {
        setStatus('loading');

        try {
            const response = await api.post('/student/attendance/scan', { token });
            setResult(response.data.data);
            setStatus('success');
        } catch (err) {
            setErrorMessage(err.response?.data?.message ?? 'Terjadi kesalahan. Coba lagi.');
            setStatus('error');
        }
    };

    const handleScanUlang = () => {
        setResult(null);
        setErrorMessage('');
        setStatus('scanning');
    };

    const isCameraPermissionError =
        status === 'error' && errorMessage.toLowerCase().includes('kamera');

    const today = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <div className="space-y-5">
            {/* PAGE TITLE & LIVE SESSION BANNER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
                <div>
                    <h1 className="text-xl font-semibold text-[#1E3A5F] tracking-tight">Scan QR Absensi</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">
                        Scan QR Code yang ditampilkan oleh guru di depan kelas untuk mencatat kehadiran hari ini.
                    </p>
                </div>
                {/* DUMMY: countdown sesi kelas — backend belum expose data sesi real-time untuk siswa */}
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg shadow-sm">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
                    </span>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-[#6B7280] uppercase tracking-wide">Status Presensi Kelas</span>
                        <span className="text-[12px] text-[#1F2937] font-semibold">
                            Sesi Berlangsung: 07:15 - 07:30 WIB{' '}
                            <span className="text-blue-700 font-bold">(Tersisa 12 menit)</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* 2-COLUMN GRID: SCANNER + SIDE INFO */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* KOLOM 1: SCANNER CARD (real functionality) */}
                <div className="lg:col-span-7 flex flex-col gap-4 bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                        <div className="flex items-center gap-2">
                            <Video size={18} className="text-blue-700" />
                            <h2 className="text-sm font-semibold text-[#1F2937]">Scanner Kamera QR</h2>
                        </div>
                        {status === 'scanning' && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#F5F7FA] text-blue-700 border border-[#E5E7EB] text-[11px] font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                <span>Kamera Aktif • 1080p</span>
                            </div>
                        )}
                    </div>

                    {/* Viewfinder Area — video real di dalamnya */}
                    <div className="relative w-full aspect-[4/3] bg-[#0F172A] rounded-lg overflow-hidden border border-[#E5E7EB]">
                        {status === 'scanning' && (
                            <>
                                {/* Elemen video real dari html5-qrcode */}
                                <div id={SCANNER_ELEMENT_ID} className="absolute inset-0 w-full h-full" />

                                {/* Overlay dekoratif — tidak mengganggu video (pointer-events-none) */}
                                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 text-white rounded text-[11px]">
                                            <CheckCircle2 size={14} className="text-emerald-400" />
                                            <span>Sensor Siap</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-black/60 rounded p-1 pointer-events-auto">
                                            <button
                                                disabled
                                                title="Fitur belum tersedia"
                                                className="p-1.5 text-white/50 rounded cursor-not-allowed"
                                            >
                                                <SwitchCamera size={16} />
                                            </button>
                                            <button
                                                disabled
                                                title="Fitur belum tersedia"
                                                className="p-1.5 text-white/50 rounded cursor-not-allowed"
                                            >
                                                <Zap size={16} />
                                            </button>
                                            <button
                                                disabled
                                                title="Fitur belum tersedia"
                                                className="p-1.5 text-white/50 rounded cursor-not-allowed"
                                            >
                                                <Maximize size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="self-center relative w-48 h-48 md:w-56 md:h-56">
                                        <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-white rounded-tl" />
                                        <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-white rounded-tr" />
                                        <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-white rounded-bl" />
                                        <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-white rounded-br" />
                                        <div className="absolute left-1 right-1 top-1/2 h-0.5 bg-blue-400 shadow-[0_0_10px_#60a5fa] animate-pulse" />
                                        <div className="absolute -bottom-6 inset-x-0 text-center">
                                            <span className="px-2 py-0.5 bg-black/70 text-white/90 rounded text-[10px]">
                                                Arahkan tepat ke QR guru
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between bg-black/65 px-3 py-1.5 rounded">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                            <span className="text-white/90 text-[11px]">Menunggu QR Code terdeteksi...</span>
                                        </div>
                                        {/* DUMMY: FPS/latensi bukan angka real, sekadar dekorasi teknis */}
                                        <span className="text-white/50 text-[10px] font-mono">FPS: 30 • Latensi: 14ms</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {status === 'loading' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F5F7FA] text-center px-4">
                                <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm font-semibold text-[#1F2937]">Memvalidasi Data...</span>
                                <span className="text-[11px] text-[#6B7280]">
                                    Memverifikasi token &amp; status sesi absensi
                                </span>
                            </div>
                        )}

                        {status === 'success' && result && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-emerald-50 text-center px-4">
                                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                    <Check size={18} />
                                </div>
                                <span className="text-emerald-700 font-bold text-sm">Absensi Berhasil!</span>
                                <span className="text-[11px] text-[#1F2937]">
                                    Pukul {result.waktu} WIB
                                </span>
                                <span className="text-[11px] text-[#6B7280]">
                                    {result.mata_pelajaran} • {result.nama} ({result.kelas})
                                </span>
                                <span className="mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded text-[10px] font-bold uppercase">
                                    {result.status}
                                </span>
                            </div>
                        )}

                        {status === 'error' && isCameraPermissionError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4">
                                <VideoOff size={32} className="text-red-500" />
                                <span className="text-white font-semibold text-sm">Akses Kamera Ditolak</span>
                                <span className="text-white/60 text-[11px] max-w-xs">{errorMessage}</span>
                            </div>
                        )}

                        {status === 'error' && !isCameraPermissionError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-50 text-center px-4">
                                <AlertTriangle size={32} className="text-red-600" />
                                <span className="text-red-700 font-bold text-sm">QR Tidak Valid</span>
                                <span className="text-[#6B7280] text-[11px] max-w-xs">{errorMessage}</span>
                            </div>
                        )}
                    </div>

                    {/* Tombol Aksi Scanner */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                        {status === 'error' ? (
                            <button
                                onClick={handleScanUlang}
                                className="w-full sm:flex-1 h-9 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-[12px] font-semibold rounded flex items-center justify-center gap-2 transition-colors"
                            >
                                <ScanLine size={16} />
                                <span>Mulai Pemindaian Ulang</span>
                            </button>
                        ) : (
                            <button
                                disabled
                                className="w-full sm:flex-1 h-9 bg-[#1E3A5F]/60 text-white text-[12px] font-semibold rounded flex items-center justify-center gap-2 cursor-not-allowed"
                            >
                                <QrCode size={16} />
                                <span>
                                    {status === 'scanning' && 'Sedang Memindai...'}
                                    {status === 'loading' && 'Memproses...'}
                                    {status === 'success' && 'Absensi Tercatat'}
                                </span>
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/student/dashboard')}
                            className="w-full sm:w-auto px-4 h-9 bg-white border border-[#E5E7EB] text-[#1F2937] hover:bg-[#F5F7FA] text-[12px] font-semibold rounded flex items-center justify-center gap-2 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            <span>Kembali ke Dashboard</span>
                        </button>
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded bg-[#F5F7FA] border border-[#E5E7EB]">
                        <Info size={18} className="text-blue-700 shrink-0 mt-0.5" />
                        <p className="text-[12px] text-[#6B7280]">
                            Pastikan QR Code berasal dari sesi absensi resmi guru yang sedang aktif di proyektor kelas.
                        </p>
                    </div>
                </div>

                {/* KOLOM 2: SIDE INFO PANELS */}
                <div className="lg:col-span-5 flex flex-col gap-5">
                    {/* DUMMY: backend belum ada endpoint detail sesi aktif untuk siswa sebelum scan */}
                    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm">
                        <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                            <div className="flex items-center gap-2">
                                <CalendarCheck size={18} className="text-blue-700" />
                                <h3 className="text-sm font-semibold text-[#1F2937]">Status Sesi Absensi Aktif</h3>
                            </div>
                            <span className="text-[11px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                                Menunggu Scan Siswa
                            </span>
                        </div>
                        <div className="divide-y divide-[#E5E7EB] text-[13px] mt-1">
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-[#6B7280]">Mata Pelajaran</span>
                                <span className="font-semibold text-[#1F2937]">Pemrograman Web (PPL001)</span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-[#6B7280]">Guru Pengampu</span>
                                <span className="font-semibold text-[#1F2937]">Andi Pratama, S.Kom</span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-[#6B7280]">Rombongan Belajar</span>
                                <span className="font-semibold text-[#1F2937]">XI PPLG 3</span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-[#6B7280]">Waktu Sesi</span>
                                <span className="font-semibold text-[#1F2937]">07:15 - 07:30 WIB</span>
                            </div>
                            <div className="py-2.5 flex flex-col gap-1">
                                <span className="text-[#6B7280] text-[11px]">Lokasi Presensi</span>
                                {/* Sistem TIDAK punya validasi geofencing/GPS sama sekali — tidak boleh ditampilkan sebagai fitur aktif */}
                                <div className="flex items-center gap-1.5 text-[#1F2937] font-semibold text-[12px]">
                                    <MapPin size={14} className="text-[#9CA3AF]" />
                                    <span className="text-[#9CA3AF]">Validasi lokasi belum tersedia</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panduan — konten statis, tidak tergantung data */}
                    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-sm">
                        <div className="flex items-center gap-2 pb-2 border-b border-[#E5E7EB]">
                            <BookOpen size={18} className="text-blue-700" />
                            <h3 className="text-sm font-semibold text-[#1F2937]">Panduan Cara Melakukan Absensi</h3>
                        </div>
                        <div className="flex flex-col gap-4 mt-4">
                            {[
                                {
                                    title: 'Buka kamera scanner pada perangkat',
                                    desc: 'Pastikan izin akses kamera pada peramban telah diberikan.',
                                },
                                {
                                    title: 'Arahkan viewfinder ke QR Code dinamis guru',
                                    desc: 'QR diperbarui secara berkala di layar monitor atau proyektor kelas.',
                                },
                                {
                                    title: 'Sistem memverifikasi token dan sesi absensi',
                                    desc: 'Validasi token, status sesi, dan kesesuaian kelas berjalan otomatis.',
                                },
                                {
                                    title: 'Konfirmasi berhasil tercatat di sistem',
                                    desc: 'Status kehadiran langsung tersimpan dan tampil di riwayat absensi.',
                                },
                            ].map((step, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#1E3A5F] text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[12px] font-semibold text-[#1F2937]">{step.title}</span>
                                        <span className="text-[11px] text-[#6B7280]">{step.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* SPESIFIKASI 7 STATE — panel preview statis, bukan komponen interaktif */}
            <section className="pt-4 border-t border-[#E5E7EB] space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <LayoutGrid size={18} className="text-blue-700" />
                            <h3 className="text-sm font-semibold text-[#1F2937]">
                                Spesifikasi State Interaksi Sistem Absensi QR
                            </h3>
                        </div>
                        <p className="text-[12px] text-[#6B7280]">
                            Kompilasi variasi tampilan state scanner (contoh statis, bukan interaktif).
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col gap-2 shadow-sm">
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                            <span className="text-[10px] text-[#6B7280] uppercase font-semibold">State: Standby</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-[#F5F7FA] text-blue-700 rounded">Waiting</span>
                        </div>
                        <div className="h-28 bg-[#0F172A] rounded flex flex-col items-center justify-center text-center p-2">
                            <QrCode size={26} className="text-white/50 mb-1" />
                            <span className="text-[11px] text-white/90">Kamera Standby</span>
                        </div>
                    </div>

                    <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col gap-2 shadow-sm">
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                            <span className="text-[10px] text-[#6B7280] uppercase font-semibold">State: Validasi</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-[#F5F7FA] text-blue-700 rounded">Checking</span>
                        </div>
                        <div className="h-28 bg-[#F5F7FA] rounded flex flex-col items-center justify-center text-center p-2">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-1" />
                            <span className="text-[11px] text-[#1F2937] font-semibold">Memvalidasi...</span>
                        </div>
                    </div>

                    <div className="bg-white border border-emerald-200 rounded-lg p-4 flex flex-col gap-2 shadow-sm bg-emerald-50/40">
                        <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                            <span className="text-[10px] text-emerald-700 uppercase font-semibold">State: Berhasil</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold">
                                HADIR
                            </span>
                        </div>
                        <div className="h-28 bg-emerald-50 rounded flex flex-col items-center justify-center text-center p-2 border border-emerald-200">
                            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1">
                                <Check size={16} />
                            </div>
                            <span className="text-[11px] text-emerald-700 font-bold">Absensi Berhasil!</span>
                        </div>
                    </div>

                    <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col gap-2 shadow-sm">
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                            <span className="text-[10px] text-red-600 uppercase font-semibold">State: Tidak Valid</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded">
                                Expired
                            </span>
                        </div>
                        <div className="h-28 bg-red-50 rounded flex flex-col items-center justify-center text-center p-2 border border-red-200">
                            <AlertTriangle size={24} className="text-red-600 mb-1" />
                            <span className="text-[11px] text-red-700 font-bold">QR Tidak Valid / Kadaluarsa</span>
                        </div>
                    </div>

                    <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col gap-2 shadow-sm">
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                            <span className="text-[10px] text-[#6B7280] uppercase font-semibold">State: Tidak Ada Sesi</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-[#F5F7FA] text-[#6B7280] border border-[#E5E7EB] rounded">
                                Idle
                            </span>
                        </div>
                        <div className="h-28 bg-[#F5F7FA] rounded flex flex-col items-center justify-center text-center p-2 border border-[#E5E7EB]">
                            <CalendarX size={24} className="text-[#9CA3AF] mb-1" />
                            <span className="text-[11px] text-[#1F2937] font-semibold">Tidak Ada Sesi Aktif</span>
                        </div>
                    </div>

                    <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col gap-2 shadow-sm">
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                            <span className="text-[10px] text-red-600 uppercase font-semibold">State: Izin Kamera</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded">
                                Denied
                            </span>
                        </div>
                        <div className="h-28 bg-[#0F172A] rounded flex flex-col items-center justify-center text-center p-2">
                            <VideoOff size={24} className="text-red-500 mb-1" />
                            <span className="text-[11px] text-white font-semibold">Akses Kamera Ditolak</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}