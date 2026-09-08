import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    QrCode,
    FilePlus,
    Clock,
    PieChart,
    CheckCircle2,
    FileText,
    ShieldCheck,
    History,
    FileDown,
    Megaphone,
    CalendarClock,
    User as UserIcon,
    ScanLine,
    Eye,
} from 'lucide-react';
import api from '../../Lib/axios';

const STATUS_BADGE = {
    hadir: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    izin: 'bg-amber-50 text-amber-700 border border-amber-200',
    sakit: 'bg-blue-50 text-blue-700 border border-blue-200',
    alpa: 'bg-red-50 text-red-700 border border-red-200',
};

const STATUS_LABEL = {
    hadir: 'Hadir',
    izin: 'Izin',
    sakit: 'Sakit',
    alpa: 'Alpa',
};

function formatTanggal(dateStr) {
    if (!dateStr) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(dateStr));
}

export default function StudentDashboard() {
    const [data, setData] = useState(null);
    const [riwayat, setRiwayat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [dashboardRes, historyRes] = await Promise.all([
                    api.get('/student/dashboard'),
                    api.get('/student/attendance/history'),
                ]);

                setData(dashboardRes.data);
                setRiwayat((historyRes.data.data || []).slice(0, 5));
            } catch (err) {
                setErrorMsg('Gagal memuat data dashboard.');
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    if (loading) {
        return (
            <p className="text-[#6B7280] text-sm">
                Memuat data...
            </p>
        );
    }

    if (errorMsg || !data) {
        return (
            <p className="text-red-600 text-sm">
                {errorMsg || 'Data tidak tersedia.'}
            </p>
        );
    }

    const { hadir, izin, sakit, alpa } = data.riwayat;

    const totalRecord = hadir + izin + sakit + alpa;

    const persenHadir =
        totalRecord > 0
            ? (hadir / totalRecord) * 100
            : 0;

    const persenHadirLabel = persenHadir.toFixed(1);

    let predikat = 'Belum Ada Data';
    let predikatColor = 'text-[#6B7280]';

    if (totalRecord > 0) {
        if (persenHadir >= 85) {
            predikat = 'Sangat Baik';
            predikatColor = 'text-emerald-700';
        } else if (persenHadir >= 75) {
            predikat = 'Baik';
            predikatColor = 'text-amber-700';
        } else {
            predikat = 'Perlu Perhatian';
            predikatColor = 'text-red-700';
        }
    }

    return (
        <div className="space-y-5">

            {/* 1. WELCOME HERO */}
            <section className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-4 border-b border-[#E5E7EB]">

                    <div>
                        <h1 className="text-xl font-semibold text-[#1E3A5F] tracking-tight">
                            Selamat Datang, {data.nama} 👋
                        </h1>

                        <p className="text-sm text-[#6B7280] mt-1">
                            Lihat status kehadiran dan aktivitas absensi kamu hari ini •{' '}
                            <span className="font-semibold text-[#1F2937]">
                                Kelas {data.kelas}
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-[#F5F7FA] px-3 py-1.5 rounded-lg border border-[#E5E7EB] flex items-center gap-2">

                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />

                            <span className="text-[12px] text-[#1F2937]">
                                Status Absensi Hari Ini:
                            </span>

                            {/* DUMMY: backend belum menyediakan status absensi harian */}
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] px-2 py-0.5 rounded font-semibold uppercase">
                                Belum Absen
                            </span>

                        </div>
                    </div>
                </div>

                {/* DUMMY: info sesi & countdown */}
                <div className="pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-[#F5F7FA]/60 -mx-5 -mb-5 p-5 rounded-b-xl">

                    <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#1E3A5F]">
                            <Clock size={20} />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">

                                <span className="text-sm font-semibold text-[#1E3A5F]">
                                    07:15 WIB
                                </span>

                                <span className="text-xs text-[#E5E7EB]">
                                    •
                                </span>

                                <span className="text-sm text-[#6B7280]">
                                    Sesi 1 Berlangsung
                                </span>

                            </div>

                            <p className="text-[11px] text-[#6B7280]">
                                Batas waktu absensi sesi 1:{' '}
                                <strong className="text-red-600">
                                    07:30 WIB
                                </strong>{' '}
                                (Tersisa 15 menit)
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">

                        <button
                            onClick={() => navigate('/student/scan')}
                            className="flex-1 md:flex-none h-9 px-4 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                        >
                            <QrCode size={16} />
                            <span>Scan QR Sekarang</span>
                        </button>

                        <button
                            disabled
                            title="Fitur belum tersedia"
                            className="flex-1 md:flex-none h-9 px-4 bg-white text-[#9CA3AF] border border-[#E5E7EB] text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-not-allowed"
                        >
                            <FilePlus size={16} />
                            <span>Ajukan Izin / Sakit</span>
                        </button>

                    </div>
                </div>
            </section>

            {/* 2. STAT CARDS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">

                        <span className="text-[12px] text-[#6B7280] font-medium">
                            Total Kehadiran
                        </span>

                        <PieChart
                            size={18}
                            className="text-[#1E3A5F]"
                        />

                    </div>

                    <div className="mt-2">
                        <span className="text-2xl font-bold text-[#1E3A5F]">
                            {persenHadirLabel}%
                        </span>

                        <p className="text-[11px] text-[#6B7280] mt-1">
                            Target sekolah: ≥ 90.0%
                        </p>
                    </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm">

                    <div className="flex items-center justify-between">

                        <span className="text-[12px] text-[#6B7280] font-medium">
                            Total Hadir
                        </span>

                        <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                            <CheckCircle2 size={16} />
                        </div>

                    </div>

                    <div className="mt-2">

                        <span className="text-2xl font-bold text-[#1F2937]">
                            {hadir}{' '}
                            <span className="text-sm font-normal text-[#6B7280]">
                                Hari
                            </span>
                        </span>

                        <p className="text-[11px] text-[#6B7280] mt-1">
                            Dari {totalRecord} total record
                        </p>

                    </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm">

                    <div className="flex items-center justify-between">

                        <span className="text-[12px] text-[#6B7280] font-medium">
                            Total Izin
                        </span>

                        <div className="w-7 h-7 rounded bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                            <FileText size={16} />
                        </div>

                    </div>

                    <div className="mt-2">

                        <span className="text-2xl font-bold text-[#1F2937]">
                            {izin}{' '}
                            <span className="text-sm font-normal text-[#6B7280]">
                                Hari
                            </span>
                        </span>

                    </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm">

                    <div className="flex items-center justify-between">

                        <span className="text-[12px] text-[#6B7280] font-medium">
                            Sakit &amp; Alpa
                        </span>

                        <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                            <ShieldCheck size={16} />
                        </div>

                    </div>

                    <div className="mt-2">

                        <span className="text-2xl font-bold text-[#1F2937]">
                            {sakit} S{' '}
                            <span className="text-sm text-[#E5E7EB]">
                                /
                            </span>{' '}
                            {alpa} A
                        </span>

                    </div>
                </div>
            </section>

            {/* 3. GRID 2 KOLOM */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                {/* KIRI */}
                <div className="lg:col-span-7 space-y-5">

                    {/* JADWAL & SESI */}
                    <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">

                        <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">

                            <div>
                                <h2 className="text-sm font-semibold text-[#1E3A5F]">
                                    Jadwal &amp; Sesi Absensi Hari Ini
                                </h2>

                                <p className="text-[11px] text-[#6B7280]">
                                    Data contoh — menunggu endpoint backend
                                </p>
                            </div>

                        </div>

                        <div className="divide-y divide-[#E5E7EB]">

                            {[
                                {
                                    sesi: 1,
                                    mapel: 'Pemrograman Web',
                                    guru: 'Andi Pratama, S.Kom',
                                    jam: '07.15 - 09.30 WIB',
                                    status: 'aktif',
                                },
                                {
                                    sesi: 2,
                                    mapel: 'Matematika Wajib',
                                    guru: 'Budi Santoso, M.Pd',
                                    jam: '09.45 - 11.45 WIB',
                                    status: 'akan',
                                },
                                {
                                    sesi: 3,
                                    mapel: 'Bahasa Indonesia',
                                    guru: 'Siti Rahmawati, S.Pd',
                                    jam: '12.30 - 14.30 WIB',
                                    status: 'akan',
                                },
                            ].map((item) => (

                                <div
                                    key={item.sesi}
                                    className="p-4"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">

                                        <div className="space-y-1">

                                            <div className="flex items-center gap-2">

                                                <span className="text-[11px] bg-[#1E3A5F]/10 text-[#1E3A5F] px-2 py-0.5 rounded font-semibold">
                                                    Sesi {item.sesi}
                                                </span>

                                                <h3 className="text-sm font-semibold text-[#1F2937]">
                                                    {item.mapel}
                                                </h3>

                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 text-[#6B7280] text-[12px]">

                                                <span className="flex items-center gap-1">
                                                    <UserIcon size={14} />
                                                    {item.guru}
                                                </span>

                                                <span>•</span>

                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {item.jam}
                                                </span>

                                            </div>
                                        </div>

                                        {item.status === 'aktif' ? (

                                            <button
                                                onClick={() => navigate('/student/scan')}
                                                className="h-8 px-3 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-[11px] font-semibold rounded flex items-center gap-1 shadow-sm"
                                            >
                                                <QrCode size={14} />
                                                <span>
                                                    Scan QR Sesi Ini
                                                </span>
                                            </button>

                                        ) : (

                                            <button
                                                disabled
                                                className="h-8 px-3 bg-[#F5F7FA] text-[#9CA3AF] text-[11px] font-semibold rounded cursor-not-allowed"
                                            >
                                                Menunggu Jam Sesi
                                            </button>

                                        )}

                                    </div>
                                </div>

                            ))}

                        </div>
                    </div>

                    {/* RIWAYAT ABSENSI */}
                    <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">

                        <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">

                            <div>
                                <h2 className="text-sm font-semibold text-[#1E3A5F]">
                                    Riwayat Absensi Terbaru
                                </h2>

                                <p className="text-[11px] text-[#6B7280]">
                                    5 catatan presensi terakhir
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/student/history')}
                                className="text-[12px] font-semibold text-blue-700 hover:underline flex items-center gap-1"
                            >
                                Lihat Semua Riwayat
                            </button>

                        </div>

                        <div className="overflow-x-auto">

                            <table className="w-full text-left border-collapse">

                                <thead>

                                    <tr className="bg-[#F5F7FA] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">

                                        <th className="py-2 px-3">
                                            Tanggal
                                        </th>

                                        <th className="py-2 px-3">
                                            Mata Pelajaran
                                        </th>

                                        <th className="py-2 px-3">
                                            Guru Pengampu
                                        </th>

                                        <th className="py-2 px-3">
                                            Waktu Presensi
                                        </th>

                                        <th className="py-2 px-3 text-right">
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-[#E5E7EB] text-[12px]">

                                    {riwayat.length === 0 ? (

                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-4 px-3 text-center text-[#6B7280]"
                                            >
                                                Belum ada riwayat absensi.
                                            </td>
                                        </tr>

                                    ) : (

                                        riwayat.map((row) => (

                                            <tr key={row.id}>

                                                <td className="py-2 px-3 font-medium text-[#1F2937]">
                                                    {formatTanggal(row.tanggal)}
                                                </td>

                                                <td className="py-2 px-3 text-[#1F2937]">
                                                    {row.mata_pelajaran}
                                                </td>

                                                <td className="py-2 px-3 text-[#6B7280]">
                                                    –
                                                </td>

                                                <td className="py-2 px-3 font-mono text-[#1F2937]">
                                                    {row.waktu || '-'}
                                                </td>

                                                <td className="py-2 px-3 text-right">

                                                    <span
                                                        className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                                                            STATUS_BADGE[row.status] ||
                                                            'bg-[#F5F7FA] text-[#6B7280]'
                                                        }`}
                                                    >
                                                        {STATUS_LABEL[row.status] ||
                                                            row.status}
                                                    </span>

                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>
                            </table>

                        </div>
                    </div>
                </div>

                {/* KANAN */}
                <div className="lg:col-span-5 space-y-5">

                    {/* PERSENTASE KEHADIRAN */}
                    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm">

                        <div className="pb-3 border-b border-[#E5E7EB] flex items-center justify-between">

                            <div>
                                <h2 className="text-sm font-semibold text-[#1E3A5F]">
                                    Persentase Kehadiran
                                </h2>

                                <p className="text-[11px] text-[#6B7280]">
                                    Seluruh periode tercatat
                                </p>
                            </div>

                        </div>

                        <div className="py-4 flex flex-col items-center justify-center border-b border-[#E5E7EB]">

                            <div className="relative w-40 h-40">

                                <svg
                                    className="w-full h-full transform -rotate-90"
                                    viewBox="0 0 36 36"
                                >

                                    <path
                                        className="text-[#E5E7EB] stroke-current"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        strokeWidth="3.5"
                                    />

                                    <path
                                        className="text-emerald-500 stroke-current"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        strokeDasharray={`${persenHadirLabel}, 100`}
                                        strokeLinecap="round"
                                        strokeWidth="3.5"
                                    />

                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">

                                    <span className="text-xl font-bold text-[#1E3A5F]">
                                        {persenHadirLabel}%
                                    </span>

                                    <span className="text-[10px] text-[#6B7280] font-medium">
                                        Tingkat Kehadiran
                                    </span>

                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 w-full mt-4">

                                {[
                                    {
                                        label: 'Hadir',
                                        value: hadir,
                                        color: 'bg-emerald-500',
                                    },
                                    {
                                        label: 'Izin',
                                        value: izin,
                                        color: 'bg-amber-500',
                                    },
                                    {
                                        label: 'Sakit',
                                        value: sakit,
                                        color: 'bg-blue-500',
                                    },
                                    {
                                        label: 'Alpa',
                                        value: alpa,
                                        color: 'bg-red-500',
                                    },
                                ].map((item) => (

                                    <div
                                        key={item.label}
                                        className="p-2 rounded bg-[#F5F7FA] border border-[#E5E7EB]/60 flex items-center justify-between"
                                    >

                                        <span className="flex items-center gap-1.5 text-[11px] text-[#1F2937]">

                                            <span
                                                className={`w-2 h-2 rounded-full ${item.color}`}
                                            />

                                            {item.label}

                                        </span>

                                        <span className="text-[11px] font-semibold text-[#1F2937]">
                                            {item.value} Hari (
                                            {totalRecord > 0
                                                ? (
                                                    (item.value / totalRecord) *
                                                    100
                                                ).toFixed(1)
                                                : 0}
                                            %)
                                        </span>

                                    </div>

                                ))}

                            </div>
                        </div>

                        <div className="mt-3 bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg p-2.5 flex items-start gap-2">

                            <ShieldCheck
                                size={18}
                                className={predikatColor}
                            />

                            <p className="text-[12px] text-[#1F2937]">

                                <strong
                                    className={`font-semibold ${predikatColor}`}
                                >
                                    Predikat: {predikat}.
                                </strong>{' '}

                                Berdasarkan seluruh riwayat absensi yang tercatat.

                            </p>

                        </div>
                    </div>

                    {/* AKSI CEPAT */}
                    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm">

                        <h2 className="text-sm font-semibold text-[#1E3A5F] mb-2">
                            Aksi Cepat Siswa
                        </h2>

                        <div className="grid grid-cols-3 gap-2">

                            <button
                                onClick={() => navigate('/student/scan')}
                                className="p-2.5 border border-[#E5E7EB] rounded-lg hover:border-[#1E3A5F] hover:bg-[#F5F7FA] flex flex-col items-center justify-center text-center transition-colors"
                            >
                                <ScanLine
                                    size={20}
                                    className="text-[#1E3A5F]"
                                />

                                <span className="text-[11px] text-[#1F2937] mt-1">
                                    Scan QR
                                </span>
                            </button>

                            <button
                                onClick={() => navigate('/student/history')}
                                className="p-2.5 border border-[#E5E7EB] rounded-lg hover:border-[#1E3A5F] hover:bg-[#F5F7FA] flex flex-col items-center justify-center text-center transition-colors"
                            >
                                <History
                                    size={20}
                                    className="text-[#1E3A5F]"
                                />

                                <span className="text-[11px] text-[#1F2937] mt-1">
                                    Rekap Absensi
                                </span>
                            </button>

                            <button
                                disabled
                                title="Fitur belum tersedia"
                                className="p-2.5 border border-[#E5E7EB] rounded-lg flex flex-col items-center justify-center text-center opacity-50 cursor-not-allowed"
                            >
                                <FileDown
                                    size={20}
                                    className="text-[#6B7280]"
                                />

                                <span className="text-[11px] text-[#6B7280] mt-1">
                                    Form Izin
                                </span>
                            </button>

                        </div>
                    </div>

                    {/* PENGUMUMAN */}
                    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm">

                        <div className="flex items-center gap-2 mb-2">

                            <Megaphone
                                size={18}
                                className="text-blue-700"
                            />

                            <h3 className="text-sm font-semibold text-[#1F2937]">
                                Pengumuman Akademik
                            </h3>

                        </div>

                        <div className="p-3 bg-[#F5F7FA] border-l-4 border-blue-600 rounded-r-lg">

                            <p className="text-[12px] text-[#1F2937] font-medium">
                                Libur &amp; Persiapan Penilaian Tengah Semester (PTS)
                            </p>

                            <p className="text-[11px] text-[#6B7280] mt-1">
                                Info contoh — fitur pengumuman belum tersedia di backend.
                            </p>

                        </div>
                    </div>
                </div>
            </div>

            {/* 4. PREVIEW STATE */}
            <section className="pt-4 border-t border-[#E5E7EB] space-y-3">

                <div>

                    <h2 className="text-sm font-semibold text-[#1E3A5F]">
                        Pratinjau Aktivitas Absensi
                    </h2>

                    <p className="text-[12px] text-[#6B7280]">
                        Contoh tampilan scanner, status berhasil, dan status kosong.
                    </p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* SCANNER PREVIEW */}
                    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex flex-col justify-between">

                        <div>

                            <span className="text-[12px] font-semibold text-[#1F2937]">
                                Scanner Kamera
                            </span>

                            <p className="text-[11px] text-[#6B7280] mt-1 mb-2">
                                Arahkan kamera ke QR yang ditampilkan guru.
                            </p>

                            <div className="relative bg-[#27313F] rounded-lg p-4 flex flex-col items-center justify-center text-center h-32">

                                <div className="w-20 h-20 border-2 border-dashed border-emerald-400 rounded-lg flex items-center justify-center">

                                    <ScanLine
                                        size={28}
                                        className="text-white/40"
                                    />

                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/student/scan')}
                            className="mt-3 w-full h-8 bg-[#F5F7FA] hover:bg-[#E5E7EB] text-[#1E3A5F] border border-[#E5E7EB] text-[11px] font-semibold rounded flex items-center justify-center gap-1"
                        >
                            <Eye size={14} />
                            <span>Buka Halaman Scan</span>
                        </button>

                    </div>

                    {/* SUCCESS STATE */}
                    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm">

                        <span className="text-[12px] font-semibold text-[#1F2937]">
                            Contoh: Absen Berhasil
                        </span>

                        <p className="text-[11px] text-[#6B7280] mt-1 mb-2">
                            Tampilan setelah scan QR berhasil (contoh).
                        </p>

                        <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-1">

                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                                Hadir • Tepat Waktu
                            </span>

                            <p className="text-[11px] text-[#1F2937] font-medium">
                                Pemrograman Web (PPL001)
                            </p>

                            <p className="text-[10px] text-[#6B7280]">
                                Verifikator: Andi Pratama, S.Kom
                            </p>

                        </div>
                    </div>

                    {/* EMPTY STATE */}
                    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm">

                        <span className="text-[12px] font-semibold text-[#1F2937]">
                            Contoh: Tidak Ada Sesi
                        </span>

                        <p className="text-[11px] text-[#6B7280] mt-1 mb-2">
                            Tampilan di luar jam belajar/hari libur.
                        </p>

                        <div className="p-3 bg-[#F5F7FA] border border-dashed border-[#E5E7EB] rounded-lg text-center flex flex-col items-center justify-center h-24">

                            <CalendarClock
                                size={20}
                                className="text-[#9CA3AF] mb-1"
                            />

                            <span className="text-[11px] font-semibold text-[#1F2937]">
                                Tidak Ada Sesi Absensi Aktif
                            </span>

                        </div>
                    </div>

                </div>
            </section>

            {/* FOOTER */}
            <footer className="pt-4 pb-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-2 text-[#6B7280] text-[11px]">

                <p>
                    © 2026 EduAttend Pro. Sistem Absensi Siswa Berbasis Digital Terpadu.
                </p>

            </footer>

        </div>
    );
}   