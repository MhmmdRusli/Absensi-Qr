import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
    Plus,
    CalendarDays,
    Radio,
    Users,
    BarChart3,
    Clock,
    Monitor,
    QrCode,
    Info,
    CalendarX,
    Play,
    X,
    RefreshCw,
    FileText,
    BellRing,
    PlusSquare,
} from 'lucide-react';
import api from '../../Lib/axios';

const STATUS_DOT = { hadir: 'bg-emerald-500', izin: 'bg-amber-500', sakit: 'bg-blue-500', alpa: 'bg-red-500' };
const STATUS_LABEL = { hadir: 'Hadir', izin: 'Izin', sakit: 'Sakit', alpa: 'Alpa' };

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

function getRemainingMinutes(tanggal, waktuSelesai) {
    if (!tanggal || !waktuSelesai) return null;
    const end = new Date(`${tanggal}T${waktuSelesai}:00`);
    const diffMs = end.getTime() - Date.now();
    return Math.max(0, Math.round(diffMs / 60000));
}

export default function TeacherDashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [todaySessions, setTodaySessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [tick, setTick] = useState(0);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [qrModalSessionId, setQrModalSessionId] = useState(null);

    const loadAll = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const [statsRes, sessionsRes] = await Promise.all([
                api.get('/teacher/dashboard'),
                api.get('/teacher/sessions'),
            ]);
            setStats(statsRes.data.stats);

            const today = todayStr();
            const todayList = (sessionsRes.data.data || []).filter((s) => s.tanggal === today);

            const details = await Promise.all(
                todayList.map((s) =>
                    api
                        .get(`/teacher/sessions/${s.id}`)
                        .then((r) => r.data.data)
                        .catch(() => null)
                )
            );

            const merged = todayList.map((s, i) => ({ ...s, ...(details[i] || {}) }));
            setTodaySessions(merged);
        } catch (err) {
            setErrorMsg('Gagal memuat data dashboard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    // Ticker untuk memperbarui hitung mundur "tersisa X menit" setiap 30 detik
    useEffect(() => {
        const interval = setInterval(() => setTick((t) => t + 1), 30000);
        return () => clearInterval(interval);
    }, []);

    const activeSessions = todaySessions.filter((s) => s.status === 'active');
    const closedSessions = todaySessions.filter((s) => s.status === 'closed');
    const heroSession = activeSessions[0] || null;

    // Rekapitulasi kehadiran (real, diagregasi dari detail siswa tiap sesi hari ini)
    const breakdown = useMemo(() => {
        const counts = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
        todaySessions.forEach((s) => {
            (s.siswa || []).forEach((st) => {
                if (counts[st.status] !== undefined) counts[st.status] += 1;
            });
        });
        const total = counts.hadir + counts.izin + counts.sakit + counts.alpa;
        return { ...counts, total };
    }, [todaySessions]);

    const tingkatKehadiran =
        stats && stats.absensi_hari_ini > 0
            ? ((stats.siswa_hadir_hari_ini / stats.absensi_hari_ini) * 100).toFixed(1)
            : '0.0';

    const handleSessionCreated = async (newSessionId) => {
        setShowCreateModal(false);
        await loadAll();
        setQrModalSessionId(newSessionId);
    };

    const handleSessionClosed = async () => {
        await loadAll();
    };

    if (loading) {
        return <p className="text-[#6B7280] text-sm">Memuat data...</p>;
    }

    if (errorMsg || !stats) {
        return <p className="text-red-600 text-sm">{errorMsg || 'Data tidak tersedia.'}</p>;
    }

    return (
        <div className="space-y-5">
            {/* WELCOME */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div>
                    <h1 className="text-xl font-semibold text-[#1E3A5F] tracking-tight">Selamat Datang 👋</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">
                        Kelola sesi absensi dan pantau kehadiran siswa hari ini.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[#1E3A5F] hover:bg-[#16304F] text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                >
                    <Plus size={18} />
                    <span>Buat Sesi Absensi</span>
                </button>
            </div>

            {/* 4 SUMMARY CARDS (real) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] text-[#6B7280] uppercase tracking-wide">Sesi Hari Ini</p>
                        <p className="text-2xl font-semibold text-[#1F2937] mt-1">{todaySessions.length} Sesi</p>
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                            {activeSessions.length} aktif, {closedSessions.length} selesai
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] flex items-center justify-center text-[#1E3A5F]">
                        <CalendarDays size={20} />
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] text-[#6B7280] uppercase tracking-wide">Sesi Aktif</p>
                        <p className="text-2xl font-semibold text-[#1F2937] mt-1">{stats.sesi_aktif} Sesi</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Radio size={20} />
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] text-[#6B7280] uppercase tracking-wide">Total Kehadiran</p>
                        <p className="text-2xl font-semibold text-[#1F2937] mt-1">{stats.absensi_hari_ini} Siswa</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] flex items-center justify-center text-[#1E3A5F]">
                        <Users size={20} />
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] text-[#6B7280] uppercase tracking-wide">Tingkat Kehadiran</p>
                        <p className="text-2xl font-semibold text-[#1F2937] mt-1">{tingkatKehadiran}%</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <BarChart3 size={20} />
                    </div>
                </div>
            </div>

            {/* ACTIVE SESSION HERO (real, hanya tampil jika benar-benar ada) */}
            {heroSession && (
                <div className="bg-white rounded-lg border-2 border-[#1E3A5F] p-5 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] px-2 py-0.5 rounded-full font-bold uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Sesi Aktif Berlangsung
                                </span>
                                <span className="text-[12px] text-[#6B7280] flex items-center gap-1">
                                    <Clock size={14} />
                                    {heroSession.waktu_mulai} - {heroSession.waktu_selesai} WIB{' '}
                                    <strong className="text-[#1E3A5F]">
                                        (Tersisa {getRemainingMinutes(heroSession.tanggal, heroSession.waktu_selesai)} Menit)
                                    </strong>
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-[#1E3A5F]">
                                {heroSession.mata_pelajaran} — {heroSession.kelas}
                            </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setQrModalSessionId(heroSession.id)}
                                className="bg-[#1E3A5F] hover:bg-[#16304F] text-white text-[12px] font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm"
                            >
                                <Monitor size={16} />
                                <span>Tampilkan QR</span>
                            </button>
                            <button
                                onClick={() => navigate(`/teacher/sessions/${heroSession.id}`)}
                                className="bg-white border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1F2937] text-[12px] font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5"
                            >
                                <BarChart3 size={16} />
                                <span>Monitoring</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                        <div className="p-3 bg-[#F5F7FA] rounded border border-[#E5E7EB]">
                            <p className="text-[11px] text-[#6B7280]">Total Siswa</p>
                            <p className="text-lg font-bold text-[#1F2937] mt-0.5">
                                {heroSession.total_siswa ?? '-'} <span className="text-xs font-normal text-[#9CA3AF]">Siswa</span>
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                            <p className="text-[11px] text-emerald-700 font-semibold">Sudah Absen (Hadir)</p>
                            <p className="text-lg font-bold text-emerald-700 mt-0.5">
                                {heroSession.total_hadir ?? '-'}{' '}
                                <span className="text-xs font-normal text-emerald-700">
                                    Siswa (
                                    {heroSession.total_siswa
                                        ? ((heroSession.total_hadir / heroSession.total_siswa) * 100).toFixed(1)
                                        : 0}
                                    %)
                                </span>
                            </p>
                        </div>
                        <div className="p-3 bg-[#F5F7FA] rounded border border-[#E5E7EB] flex flex-col justify-center">
                            <p className="text-[11px] text-[#6B7280] font-medium">Token QR Sesi</p>
                            <code className="text-[11px] bg-white px-2 py-0.5 rounded border border-[#E5E7EB] font-bold text-[#1E3A5F] mt-1 inline-block truncate">
                                {heroSession.qr_token?.slice(0, 12)}…
                            </code>
                        </div>
                    </div>

                    {heroSession.total_siswa > 0 && (
                        <div className="mt-4">
                            <div className="flex justify-between text-[11px] text-[#6B7280] mb-1">
                                <span>Kemajuan Presensi Sesi</span>
                                <span className="font-bold text-[#1E3A5F]">
                                    {heroSession.total_hadir} dari {heroSession.total_siswa} Siswa
                                </span>
                            </div>
                            <div className="w-full bg-[#E5E7EB] rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${(heroSession.total_hadir / heroSession.total_siswa) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TWO COLUMN */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* LEFT: Sesi Hari Ini table */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-[#E5E7EB]">
                            <h4 className="text-sm font-bold text-[#1E3A5F]">Sesi Absensi Hari Ini</h4>
                            <p className="text-[12px] text-[#6B7280]">Daftar sesi kelas yang Anda buat hari ini.</p>
                        </div>

                        {todaySessions.length === 0 ? (
                            <div className="p-8 flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-[#F5F7FA] text-[#1E3A5F] flex items-center justify-center mb-3">
                                    <CalendarX size={22} />
                                </div>
                                <h5 className="text-sm font-semibold text-[#1F2937]">Tidak Ada Sesi Aktif Saat Ini</h5>
                                <p className="text-[12px] text-[#6B7280] max-w-sm mt-1 mb-4">
                                    Anda belum membuat sesi presensi kelas hari ini.
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-[12px] font-semibold px-4 py-2 rounded-lg"
                                >
                                    <Play size={16} />
                                    Mulai Sesi Sekarang
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#F5F7FA] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                                            <th className="py-2.5 px-3">Mata Pelajaran</th>
                                            <th className="py-2.5 px-3">Kelas</th>
                                            <th className="py-2.5 px-3">Waktu Sesi</th>
                                            <th className="py-2.5 px-3">Kehadiran</th>
                                            <th className="py-2.5 px-3">Status</th>
                                            <th className="py-2.5 px-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB] text-[12px]">
                                        {todaySessions.map((s) => {
                                            const pct = s.total_siswa ? (s.total_hadir / s.total_siswa) * 100 : 0;
                                            return (
                                                <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                                                    <td className="py-2.5 px-3 font-semibold text-[#1E3A5F]">
                                                        {s.mata_pelajaran}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-[#1F2937]">{s.kelas}</td>
                                                    <td className="py-2.5 px-3 text-[#6B7280]">
                                                        {s.waktu_mulai} - {s.waktu_selesai} WIB
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <div className="text-[#1F2937] font-medium">
                                                            {s.total_hadir ?? '-'} / {s.total_siswa ?? '-'} Siswa
                                                        </div>
                                                        <div className="w-20 bg-[#E5E7EB] rounded-full h-1.5 mt-1">
                                                            <div
                                                                className="bg-emerald-500 h-1.5 rounded-full"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        {s.status === 'active' ? (
                                                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                Aktif
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB] text-[10px] font-semibold px-2 py-0.5 rounded uppercase">
                                                                Selesai
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {s.status === 'active' ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => navigate(`/teacher/sessions/${s.id}`)}
                                                                        className="bg-white border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1E3A5F] text-[11px] px-2 py-1 rounded"
                                                                    >
                                                                        Monitoring
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setQrModalSessionId(s.id)}
                                                                        className="bg-[#1E3A5F] text-white hover:bg-[#16304F] text-[11px] px-2 py-1 rounded flex items-center gap-1"
                                                                    >
                                                                        <QrCode size={13} /> QR
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => navigate(`/teacher/sessions/${s.id}`)}
                                                                    className="bg-white border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1E3A5F] text-[11px] px-2 py-1 rounded font-medium"
                                                                >
                                                                    Lihat Rekap
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex items-start gap-3">
                        <Info size={18} className="text-blue-700 shrink-0 mt-0.5" />
                        <p className="text-[12px] text-[#6B7280]">
                            Sesi yang telah ditutup dapat dilihat kembali melalui menu Sesi Absensi. Untuk analisis
                            lanjutan, buka menu <strong className="text-[#1E3A5F]">Laporan &amp; Rekap</strong>.
                        </p>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Rekapitulasi (real, dari agregasi) */}
                    <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
                        <h4 className="text-sm font-bold text-[#1E3A5F] pb-2 border-b border-[#E5E7EB]">
                            Rekapitulasi Kehadiran Hari Ini
                        </h4>
                        {breakdown.total === 0 ? (
                            <p className="text-[12px] text-[#6B7280] mt-3">Belum ada data presensi hari ini.</p>
                        ) : (
                            <>
                                <div className="mt-3 w-full bg-[#E5E7EB] rounded-full h-3 flex overflow-hidden">
                                    <div className="bg-emerald-500 h-3" style={{ width: `${(breakdown.hadir / breakdown.total) * 100}%` }} />
                                    <div className="bg-amber-500 h-3" style={{ width: `${(breakdown.izin / breakdown.total) * 100}%` }} />
                                    <div className="bg-blue-500 h-3" style={{ width: `${(breakdown.sakit / breakdown.total) * 100}%` }} />
                                    <div className="bg-red-500 h-3" style={{ width: `${(breakdown.alpa / breakdown.total) * 100}%` }} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-3 text-[12px]">
                                    {['hadir', 'izin', 'sakit', 'alpa'].map((key) => (
                                        <div key={key} className="flex items-center justify-between p-2 rounded bg-[#F5F7FA] border border-[#E5E7EB]">
                                            <span className="flex items-center gap-1.5">
                                                <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[key]}`} />
                                                {STATUS_LABEL[key]}
                                            </span>
                                            <span className="font-bold text-[#1F2937]">{breakdown[key]}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* DUMMY: Aktivitas Presensi Terkini — belum ada endpoint log aktivitas */}
                    <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
                        <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                            <h4 className="text-sm font-bold text-[#1E3A5F]">Aktivitas Presensi Terkini</h4>
                            <BellRing size={16} className="text-[#9CA3AF]" />
                        </div>
                        <div className="mt-3 space-y-2 text-[12px]">
                            <p className="text-[11px] text-[#9CA3AF] italic mb-1">Contoh tampilan — fitur log aktivitas belum tersedia</p>
                            <div className="flex items-start gap-2">
                                <span className="text-[10px] font-bold text-[#9CA3AF] shrink-0 mt-0.5">08:42</span>
                                <p className="text-[#6B7280]">Ahmad Fauzan berhasil absen Hadir</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-[10px] font-bold text-[#9CA3AF] shrink-0 mt-0.5">08:00</span>
                                <p className="text-[#6B7280]">Sesi Matematika resmi dibuka</p>
                            </div>
                        </div>
                    </div>

                    {/* Aksi Cepat (real) */}
                    <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
                        <h4 className="text-sm font-bold text-[#1E3A5F] pb-2 border-b border-[#E5E7EB]">Aksi Cepat Guru</h4>
                        <div className="mt-3 space-y-2">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="w-full bg-white border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1E3A5F] text-[12px] font-medium px-3 py-2 rounded-lg flex items-center justify-between"
                            >
                                <span className="flex items-center gap-2">
                                    <PlusSquare size={16} /> Buat Sesi Baru
                                </span>
                                <span className="text-[#9CA3AF]">→</span>
                            </button>
                            <button
                                onClick={() => navigate('/teacher/sessions')}
                                className="w-full bg-white border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1E3A5F] text-[12px] font-medium px-3 py-2 rounded-lg flex items-center justify-between"
                            >
                                <span className="flex items-center gap-2">
                                    <QrCode size={16} /> Lihat Semua Sesi
                                </span>
                                <span className="text-[#9CA3AF]">→</span>
                            </button>
                            <button
                                onClick={() => navigate('/teacher/reports')}
                                className="w-full bg-white border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1E3A5F] text-[12px] font-medium px-3 py-2 rounded-lg flex items-center justify-between"
                            >
                                <span className="flex items-center gap-2">
                                    <FileText size={16} /> Rekap Absensi Semester
                                </span>
                                <span className="text-[#9CA3AF]">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <CreateSessionModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleSessionCreated}
                />
            )}

            {qrModalSessionId && (
                <QrProjectorModal
                    sessionId={qrModalSessionId}
                    onClose={() => setQrModalSessionId(null)}
                    onClosed={handleSessionClosed}
                />
            )}
        </div>
    );
}

function CreateSessionModal({ onClose, onCreated }) {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [form, setForm] = useState({
        class_id: '',
        subject_id: '',
        date: todayStr(),
        start_time: '',
        end_time: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchOptions = async () => {
            const [classesRes, subjectsRes] = await Promise.all([
                api.get('/classes-list'),
                api.get('/subjects-list'),
            ]);
            setClasses(classesRes.data.data || []);
            setSubjects(subjectsRes.data.data || []);
        };
        fetchOptions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);
        try {
            const response = await api.post('/teacher/sessions', form);
            onCreated(response.data.data.id);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-lg border border-[#E5E7EB] shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-4 py-3 bg-[#1E3A5F] text-white flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <Plus size={18} /> Buat Sesi Absensi Baru
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">Kelas</label>
                        <select
                            value={form.class_id}
                            onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                            className="w-full h-9 rounded border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#1E3A5F]"
                        >
                            <option value="">Pilih kelas</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.class_id && <p className="text-[11px] text-red-600 mt-1">{errors.class_id[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">Mata Pelajaran</label>
                        <select
                            value={form.subject_id}
                            onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                            className="w-full h-9 rounded border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#1E3A5F]"
                        >
                            <option value="">Pilih mata pelajaran</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        {errors.subject_id && <p className="text-[11px] text-red-600 mt-1">{errors.subject_id[0]}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">Waktu Mulai</label>
                            <input
                                type="time"
                                value={form.start_time}
                                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                                className="w-full h-9 rounded border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#1E3A5F]"
                            />
                            {errors.start_time && <p className="text-[11px] text-red-600 mt-1">{errors.start_time[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">Waktu Selesai</label>
                            <input
                                type="time"
                                value={form.end_time}
                                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                                className="w-full h-9 rounded border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#1E3A5F]"
                            />
                            {errors.end_time && <p className="text-[11px] text-red-600 mt-1">{errors.end_time[0]}</p>}
                        </div>
                    </div>
                    <p className="text-[11px] text-[#9CA3AF]">Sesi akan dibuat untuk tanggal hari ini ({form.date}).</p>
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5E7EB]">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1F2937] text-sm font-medium rounded-lg">
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                        >
                            {isSubmitting ? 'Memproses...' : 'Aktifkan Sesi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function QrProjectorModal({ sessionId, onClose, onClosed }) {
    const [session, setSession] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [confirmClose, setConfirmClose] = useState(false);

    const fetchSession = async () => {
        try {
            const response = await api.get(`/teacher/sessions/${sessionId}`);
            setSession(response.data.data);
        } catch (err) {
            // sesi mungkin sudah tidak ada; biarkan modal menampilkan state terakhir
        }
    };

    useEffect(() => {
        fetchSession();
        const interval = setInterval(fetchSession, 5000);
        return () => clearInterval(interval);
    }, [sessionId]);

    const handleTutupSesi = async () => {
        setIsClosing(true);
        try {
            await api.post(`/teacher/sessions/${sessionId}/close`);
            await fetchSession();
            await onClosed();
        } finally {
            setIsClosing(false);
            setConfirmClose(false);
        }
    };

    if (!session) {
        return (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 text-sm text-[#6B7280]">Memuat sesi...</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 bg-[#1E3A5F] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Monitor size={20} />
                        <div>
                            <h3 className="text-sm font-bold">Tampilan QR Sesi</h3>
                            <p className="text-[11px] text-white/80">
                                {session.mata_pelajaran} • {session.kelas}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-5 text-center space-y-4">
                    {session.status === 'active' ? (
                        <div className="inline-block bg-[#F8FAFC] p-3 rounded-xl border border-[#E5E7EB]">
                            <QRCodeSVG value={session.qr_token} size={220} />
                        </div>
                    ) : (
                        <p className="text-[#9CA3AF] py-10 text-sm">QR tidak lagi ditampilkan — sesi sudah ditutup.</p>
                    )}

                    <div className="flex items-center justify-center gap-6 text-[12px]">
                        <span className="text-[#6B7280]">
                            Hadir: <strong className="text-emerald-600">{session.total_hadir}</strong> / {session.total_siswa}
                        </span>
                        <span className="text-[#6B7280]">
                            Waktu: {session.waktu_mulai} - {session.waktu_selesai} WIB
                        </span>
                    </div>

                    {session.status === 'active' && (
                        <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#E5E7EB]">
                            {!confirmClose ? (
                                <button
                                    onClick={() => setConfirmClose(true)}
                                    className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-sm font-semibold rounded-lg"
                                >
                                    Tutup Sesi
                                </button>
                            ) : (
                                <>
                                    <span className="text-[12px] text-[#6B7280]">Yakin tutup sesi ini?</span>
                                    <button
                                        onClick={handleTutupSesi}
                                        disabled={isClosing}
                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[12px] font-semibold rounded-lg disabled:opacity-50"
                                    >
                                        {isClosing ? 'Menutup...' : 'Ya, Tutup'}
                                    </button>
                                    <button
                                        onClick={() => setConfirmClose(false)}
                                        className="px-3 py-1.5 bg-white border border-[#E5E7EB] text-[#6B7280] text-[12px] font-medium rounded-lg"
                                    >
                                        Batal
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div className="px-4 py-3 border-t border-[#E5E7EB] flex justify-end">
                    <button onClick={onClose} className="px-4 py-1.5 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-sm font-semibold rounded-lg">
                        Tutup Pratinjau
                    </button>
                </div>
            </div>
        </div>
    );
}