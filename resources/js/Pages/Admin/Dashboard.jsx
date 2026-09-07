import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../Lib/axios';
import { useAuth } from '../../Context/AuthContext';
import {
    IconStudents, IconTeachers, IconClasses, IconCheckCircle,
    IconPersonAdd, IconDownload, IconTrendingUp, IconSync,
    IconQr, IconClock, IconChevronLeft, IconChevronRight,
} from '../../Components/Icons';

// DUMMY — belum ada endpoint backend untuk data ini.
// Ganti dengan data asli setelah backend disiapkan.
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

function StatCard({ icon: Icon, label, value, footer }) {
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-start justify-between">
                <div>
                    <span className="text-xs font-medium text-slate-400">{label}</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-[#0f2942]">
                    <Icon />
                </div>
            </div>
            {footer && (
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
                    {footer}
                </div>
            )}
        </div>
    );
}

function Donut({ segments }) {
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
            <polygon points={area} fill="#0f2942" opacity="0.08" />
            <polyline points={line} fill="none" stroke="#0f2942" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {coords.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={i === coords.length - 1 ? 4.5 : 3.5}
                    fill={i === coords.length - 1 ? '#0f2942' : '#fff'} stroke="#0f2942" strokeWidth="2" />
            ))}
        </svg>
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

    if (loading) return <p className="text-slate-400 text-sm">Memuat data...</p>;
    if (error) return <p className="text-red-600 text-sm">{error}</p>;

    const statusStyle = {
        hadir: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        izin: 'bg-amber-50 text-amber-700 border-amber-200',
        sakit: 'bg-blue-50 text-blue-700 border-blue-200',
        alpa: 'bg-rose-50 text-rose-700 border-rose-200',
    };

    return (
        <div className="space-y-6">
            {/* WELCOME CARD */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        Selamat Datang, {user?.name}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Pantau aktivitas sekolah dan kehadiran siswa hari ini.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <Link to="/admin/students" className="h-9 px-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm rounded-lg flex items-center gap-2 transition-colors">
                        <IconPersonAdd />
                        <span>Tambah Siswa</span>
                    </Link>
                    <Link to="/admin/teachers" className="h-9 px-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm rounded-lg flex items-center gap-2 transition-colors">
                        <IconTeachers />
                        <span>Tambah Guru</span>
                    </Link>
                    <Link to="/admin/reports" className="h-9 px-3.5 bg-[#0f2942] hover:bg-[#16304f] text-white text-sm rounded-lg flex items-center gap-2 transition-colors">
                        <IconDownload />
                        <span>Lihat Laporan</span>
                    </Link>
                </div>
            </div>

            {/* STAT CARDS — data asli */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={IconStudents} label="Total Siswa" value={stats.total_siswa} />
                <StatCard icon={IconTeachers} label="Total Guru" value={stats.total_guru} />
                <StatCard icon={IconClasses} label="Total Kelas" value={stats.total_kelas} />
                <StatCard icon={IconCheckCircle} label="Absensi Hari Ini" value={stats.total_absensi_hari_ini} />
            </div>

            {/* RINGKASAN + TREN — dummy, menunggu backend */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Ringkasan Kehadiran</h3>
                    <p className="text-xs text-slate-400 mb-4">Distribusi status siswa (contoh data)</p>
                    <div className="flex justify-center py-2">
                        <div className="relative flex items-center justify-center">
                            <Donut segments={DUMMY_BREAKDOWN} />
                            <div className="absolute flex flex-col items-center">
                                <span className="text-xl font-bold text-slate-900">{stats.total_siswa}</span>
                                <span className="text-[11px] text-slate-400">Total Siswa</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
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

                <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Tren Kehadiran (7 Hari)</h3>
                            <p className="text-xs text-slate-400">Contoh data — menunggu endpoint historis</p>
                        </div>
                        <IconTrendingUp className="text-emerald-600" />
                    </div>
                    <TrendChart points={DUMMY_TREND} />
                    <div className="grid grid-cols-7 text-center text-[11px] text-slate-400 pt-2">
                        {DUMMY_TREND.map((p) => <div key={p.day}>{p.day}</div>)}
                    </div>
                </div>
            </div>

            {/* SESI AKTIF (dummy) + ABSENSI TERBARU (data asli) */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-900">Sesi Absensi Aktif</h3>
                        <span className="text-[11px] text-slate-400">Contoh data</span>
                    </div>
                    <div className="space-y-3">
                        {DUMMY_SESSIONS.map((s) => {
                            const pct = Math.round((s.present / s.total) * 100);
                            return (
                                <div key={s.subject} className="p-3.5 rounded-lg border border-slate-200">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-semibold text-slate-900">{s.subject}</h4>
                                                <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-500">{s.class}</span>
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                                <span>{s.teacher}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><IconClock /> {s.time}</span>
                                            </div>
                                        </div>
                                        <button className="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 text-xs rounded flex items-center gap-1 shrink-0">
                                            <IconQr /> Lihat QR
                                        </button>
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-400">Presensi Siswa</span>
                                            <span className="font-semibold text-slate-800">{s.present} / {s.total} ({pct}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                            <div className="bg-[#0f2942] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-900">Absensi Terbaru</h3>
                        <IconSync className="text-slate-300" />
                    </div>

                    {absensiTerbaru.length === 0 ? (
                        <div className="p-8 text-center text-slate-300 text-sm border border-dashed border-slate-200 rounded-lg">
                            Belum ada data absensi.
                        </div>
                    ) : (
                        <div className="overflow-x-auto border border-slate-200 rounded-lg">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase text-slate-400">
                                        <th className="py-2.5 px-3 font-semibold">Siswa</th>
                                        <th className="py-2.5 px-3 font-semibold">Kelas</th>
                                        <th className="py-2.5 px-3 font-semibold">Mata Pelajaran</th>
                                        <th className="py-2.5 px-3 font-semibold">Waktu</th>
                                        <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {absensiTerbaru.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="py-2 px-3 font-medium text-slate-800">{item.nama_siswa}</td>
                                            <td className="py-2 px-3 text-slate-500">{item.kelas}</td>
                                            <td className="py-2 px-3 text-slate-600">{item.mata_pelajaran}</td>
                                            <td className="py-2 px-3 font-mono text-xs text-slate-400">{item.waktu ?? '-'}</td>
                                            <td className="py-2 px-3 text-center">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border capitalize ${statusStyle[item.status] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span>Menampilkan {absensiTerbaru.length} entri terbaru</span>
                        <div className="flex items-center gap-1 opacity-40">
                            <IconChevronLeft />
                            <span className="px-2 py-0.5 rounded bg-slate-100">1</span>
                            <IconChevronRight />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}