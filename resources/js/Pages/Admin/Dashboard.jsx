import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../Lib/axios';
import { useAuth } from '../../Context/AuthContext';
import {
    IconStudents, IconTeachers, IconClasses, IconCheckCircle,
    IconPersonAdd, IconDownload, IconTrendingUp, IconSync,
    IconQr, IconClock, IconChevronLeft, IconChevronRight,
} from '../../Components/Icons';

const NAVY = '#1E3A5F';

const DUMMY_BREAKDOWN = [
    { label: 'Hadir', value: 0.948, color: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    { label: 'Izin', value: 0.022, color: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-700' },
    { label: 'Sakit', value: 0.018, color: '#3B82F6', bg: 'bg-blue-50', text: 'text-blue-700' },
    { label: 'Alpa', value: 0.012, color: '#EF4444', bg: 'bg-rose-50', text: 'text-rose-700' },
];
const DUMMY_TREND = [
    { day: 'Sen', pct: 93.5 }, { day: 'Sel', pct: 94.2 }, { day: 'Rab', pct: 95.0 },
    { day: 'Kam', pct: 94.6 }, { day: 'Jum', pct: 96.1 }, { day: 'Sab', pct: 93.8 },
    { day: 'Ini', pct: 94.8 },
];
const DUMMY_SESSIONS = [
    { subject: 'Pemrograman Web', class: 'XI PPLG 3', teacher: 'Pak Andi, S.Kom', time: '07:00–08:30', present: 25, total: 32 },
    { subject: 'Matematika Wajib', class: 'X MIPA 1', teacher: 'Bu Sri Wahyuni, M.Pd', time: '07:15–08:45', present: 34, total: 36 },
];

function StatCard({ icon: Icon, label, value, iconBg, iconText, footer }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {label}
                    </p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                        {value ?? '-'}
                    </p>
                </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} ${iconText}`}>
                    <Icon />
                </div>
            </div>
            {footer && (
                <p className="mt-4 text-xs text-slate-500">{footer}</p>
            )}
        </div>
    );
}

function DonutChart({ segments }) {
    const r = 64, c = 2 * Math.PI * r;
    let offset = 0;
    return (
        <svg viewBox="0 0 160 160" className="w-44 h-44 -rotate-90">
            <circle cx="80" cy="80" r={r} fill="none" stroke="#E5E7EB" strokeWidth="18" />
            {segments.map((s, i) => {
                const dash = s.value * c;
                const el = (
                    <circle key={i} cx="80" cy="80" r={r} fill="none" stroke={s.color}
                        strokeWidth="18" strokeDasharray={`${dash} ${c}`} strokeDashoffset={-offset} strokeLinecap="round" />
                );
                offset += dash;
                return el;
            })}
        </svg>
    );
}

function TrendChart({ points }) {
    const w = 560, h = 160, pad = 10;
    const max = 98, min = 90;
    const step = (w - pad * 2) / (points.length - 1);
    const coords = points.map((p, i) => {
        const x = pad + i * step;
        const y = h - ((p.pct - min) / (max - min)) * h;
        return { x, y, ...p };
    });
    const line = coords.map((p) => `${p.x},${p.y}`).join(' ');
    const area = `${line} ${coords[coords.length - 1].x},${h} ${coords[0].x},${h}`;
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
            <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={NAVY} stopOpacity="0.12" />
                    <stop offset="100%" stopColor={NAVY} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={area} fill="url(#trendGradient)" />
            <polyline points={line} fill="none" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {coords.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={i === coords.length - 1 ? 4.5 : 3.5}
                    fill={i === coords.length - 1 ? NAVY : '#fff'} stroke={NAVY} strokeWidth="2" />
            ))}
        </svg>
    );
}

function StatusBadge({ status }) {
    const styleConfig = {
        hadir: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        izin: 'bg-amber-50 text-amber-700 border-amber-200',
        sakit: 'bg-blue-50 text-blue-700 border-blue-200',
        alpa: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${styleConfig[status] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'hadir' ? 'bg-emerald-500' : status === 'izin' ? 'bg-amber-500' : status === 'sakit' ? 'bg-blue-500' : status === 'alpa' ? 'bg-red-500' : 'bg-slate-400'}`} />
            {status}
        </span>
    );
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [absensiTerbaru, setAbsensiTerbaru] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get('/admin/dashboard');
                setStats(response.data.stats);
                setAbsensiTerbaru(response.data.absensi_terbaru);
            } catch (err) {
                setError('Gagal memuat data dashboard.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <p className="text-[#6B7280] text-sm">Memuat data...</p>;
    if (error) return <p className="text-red-600 text-sm">{error}</p>;

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            {/* GRADIENT HERO */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#0f2942] via-[#173d62] to-[#1f4c7a] p-6 text-white shadow-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-100">
                            Dashboard
                        </span>
                        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
                            Panel Admin – EduAttend Pro
                        </h1>
                        <p className="mt-2 max-w-xl text-sm text-slate-200">
                            Pantau aktivitas sekolah dan kehadiran siswa secara keseluruhan. Kelola data master, sesi absensi, dan laporan kehadiran dari satu tempat.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                            to="/admin/students"
                            className="h-9 px-3.5 bg-white text-[#1E3A5F] hover:bg-slate-100 text-sm font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                        >
                            <IconPersonAdd />
                            <span>Tambah Siswa</span>
                        </Link>
                        <Link
                            to="/admin/teachers"
                            className="h-9 px-3.5 bg-white text-[#1E3A5F] hover:bg-slate-100 text-sm font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                        >
                            <IconTeachers />
                            <span>Tambah Guru</span>
                        </Link>
                        <Link
                            to="/admin/reports"
                            className="h-9 px-3.5 bg-white text-[#1E3A5F] hover:bg-slate-100 text-sm font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                        >
                            <IconDownload />
                            <span>Lihat Laporan</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={IconStudents}
                    label="Total Siswa"
                    value={stats.total_siswa}
                    iconBg="bg-sky-50"
                    iconText="text-sky-700"
                    footer="Terdaftar di sistem"
                />
                <StatCard
                    icon={IconTeachers}
                    label="Total Guru"
                    value={stats.total_guru}
                    iconBg="bg-purple-50"
                    iconText="text-purple-700"
                    footer="Aktif mengajar"
                />
                <StatCard
                    icon={IconClasses}
                    label="Total Kelas"
                    value={stats.total_kelas}
                    iconBg="bg-amber-50"
                    iconText="text-amber-700"
                    footer="Tingkat terdaftar"
                />
                <StatCard
                    icon={IconCheckCircle}
                    label="Absensi Hari Ini"
                    value={stats.total_absensi_hari_ini}
                    iconBg="bg-emerald-50"
                    iconText="text-emerald-700"
                    footer="Kehadiran tercatat"
                />
            </div>

            {/* RINGKASAN + TREN */}
            <div className="grid grid-cols-12 gap-4">
                {/* RINGKASAN KEHADIRAN */}
                <div className="col-span-12 lg:col-span-5 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                    <div className="pb-3 border-b border-[#E5E7EB]">
                        <h3 className="text-sm font-semibold text-[#1E3A5F]">Ringkasan Kehadiran</h3>
                        <p className="text-xs text-[#6B7280] mt-0.5">Distribusi status siswa (contoh data)</p>
                    </div>
                    <div className="flex justify-center py-2">
                        <div className="relative flex items-center justify-center">
                            <DonutChart segments={DUMMY_BREAKDOWN} />
                            <div className="absolute flex flex-col items-center">
                                <span className="text-xl font-bold text-[#1F2937]">{stats.total_siswa}</span>
                                <span className="text-[11px] text-[#6B7280]">Total Siswa</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#E5E7EB]">
                        {DUMMY_BREAKDOWN.map((s) => (
                            <div key={s.label} className={`flex items-center justify-between p-2 rounded-lg ${s.bg}`}>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                                    <span className="text-xs text-slate-700">{s.label}</span>
                                </div>
                                <span className={`text-xs font-semibold ${s.text}`}>{(s.value * 100).toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TREN KEHADIRAN */}
                <div className="col-span-12 lg:col-span-7 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-[#1E3A5F]">Tren Kehadiran (7 Hari)</h3>
                            <p className="text-xs text-[#6B7280]">Contoh data — menunggu endpoint historis</p>
                        </div>
                        <IconTrendingUp className="text-emerald-600" />
                    </div>
                    <TrendChart points={DUMMY_TREND} />
                    <div className="grid grid-cols-7 text-center text-[11px] text-[#6B7280] pt-2">
                        {DUMMY_TREND.map((p) => <div key={p.day}>{p.day}</div>)}
                    </div>
                </div>
            </div>

            {/* SESI AKTIF + ABSENSI TERBARU */}
            <div className="grid grid-cols-12 gap-4">
                {/* SESI AKTIF */}
                <div className="col-span-12 lg:col-span-5 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                        <h3 className="text-sm font-semibold text-[#1E3A5F]">Sesi Absensi Aktif</h3>
                        <span className="text-[11px] text-[#6B7280]">Contoh data</span>
                    </div>
                    <div className="space-y-3 mt-3">
                        {DUMMY_SESSIONS.map((s) => {
                            const pct = Math.round((s.present / s.total) * 100);
                            return (
                                <div key={s.subject} className="p-3.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F5F7FA]/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-semibold text-[#1F2937]">{s.subject}</h4>
                                                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#F5F7FA] border border-[#E5E7EB] text-[#6B7280]">{s.class}</span>
                                            </div>
                                            <div className="text-xs text-[#6B7280] mt-0.5 flex items-center gap-2">
                                                <span>{s.teacher}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><IconClock /> {s.time}</span>
                                            </div>
                                        </div>
                                        <button className="px-2.5 py-1 border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1F2937] text-xs rounded-lg flex items-center gap-1 shrink-0 transition-colors">
                                            <IconQr /> Lihat QR
                                        </button>
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-[#6B7280]">Presensi Siswa</span>
                                            <span className="font-semibold text-[#1F2937]">{s.present} / {s.total} ({pct}%)</span>
                                        </div>
                                        <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-[#1E3A5F] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ABSENSI TERBARU */}
                <div className="col-span-12 lg:col-span-7 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] mb-4">
                        <h3 className="text-sm font-semibold text-[#1E3A5F]">Absensi Terbaru</h3>
                        <div className="flex items-center gap-2 text-[#6B7280]">
                            <IconSync className="animate-spin" />
                            <span className="text-[11px]">Diperbarui</span>
                        </div>
                    </div>

                    {absensiTerbaru.length === 0 ? (
                        <div className="p-8 text-center text-[#9CA3AF] text-sm border border-dashed border-[#E5E7EB] rounded-xl">
                            Belum ada data absensi.
                        </div>
                    ) : (
                        <div className="overflow-x-auto border border-[#E5E7EB] rounded-xl">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-[#F5F7FA] border-b border-[#E5E7EB] text-[11px] uppercase tracking-wide text-[#6B7280]">
                                        <th className="py-2.5 px-3 font-semibold">Siswa</th>
                                        <th className="py-2.5 px-3 font-semibold">Kelas</th>
                                        <th className="py-2.5 px-3 font-semibold">Mata Pelajaran</th>
                                        <th className="py-2.5 px-3 font-semibold">Waktu</th>
                                        <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB]">
                                    {absensiTerbaru.map((item) => (
                                        <tr key={item.id} className="hover:bg-[#F5F7FA]/60 transition-colors">
                                            <td className="py-2 px-3 font-medium text-[#1F2937]">{item.nama_siswa}</td>
                                            <td className="py-2 px-3 text-[#6B7280]">{item.kelas}</td>
                                            <td className="py-2 px-3 text-[#1F2937]">{item.mata_pelajaran}</td>
                                            <td className="py-2 px-3 font-mono text-xs text-[#9CA3AF]">{item.waktu ?? '-'}</td>
                                            <td className="py-2 px-3 text-center">
                                                <StatusBadge status={item.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
                        <span>Menampilkan {absensiTerbaru.length} entri terbaru</span>
                        <div className="flex items-center gap-1 opacity-40">
                            <IconChevronLeft />
                            <span className="px-2 py-0.5 rounded-full bg-[#F5F7FA] border border-[#E5E7EB] text-[#1F2937]">1</span>
                            <IconChevronRight />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
