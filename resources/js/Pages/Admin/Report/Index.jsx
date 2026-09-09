import { useEffect, useMemo, useState } from 'react';
import api from '../../../Lib/axios';
import {
    Search, RotateCcw, Filter, ChevronLeft, ChevronRight, Download,
    FileText, FileSpreadsheet, Printer, TrendingUp, CheckCircle2,
    AlertCircle, ClipboardList, X, Calendar,
} from 'lucide-react';

const emptyFilters = { tanggal_mulai: '', tanggal_akhir: '', class_id: '', subject_id: '', status: '' };
const NAVY = '#1E3A5F';
const NAVY_HOVER = '#16304F';
const STUDENT_PAGE_SIZE = 10;

const fmtDate = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short' });
};

const toISO = (date) => date.toISOString().slice(0, 10);

const ratingBadge = (pct) => {
    if (pct >= 95) return { label: 'Sangat Baik', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (pct >= 85) return { label: 'Baik', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    return { label: 'Perlu Perhatian', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
};

const statusBadge = {
    hadir: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    izin: 'bg-amber-50 text-amber-700 border-amber-200',
    sakit: 'bg-blue-50 text-blue-700 border-blue-200',
    alpa: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function ReportIndex() {
    const [laporan, setLaporan] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(emptyFilters);
    const [activePreset, setActivePreset] = useState('');

    const [studentSearch, setStudentSearch] = useState('');
    const [studentPage, setStudentPage] = useState(1);

    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState('csv');

    const [classDetail, setClassDetail] = useState(null);
    const [studentDetail, setStudentDetail] = useState(null);

    const fetchOptions = async () => {
        const [classesRes, subjectsRes] = await Promise.all([
            api.get('/classes-list'),
            api.get('/subjects-list'),
        ]);
        setClasses(classesRes.data.data);
        setSubjects(subjectsRes.data.data);
    };

    const fetchLaporan = async () => {
        setLoading(true);
        const response = await api.get('/admin/reports', { params: filters });
        setLaporan(response.data.data);
        setLoading(false);
    };

    const handleExportCsv = () => {
        const params = new URLSearchParams(filters).toString();
        window.location.href = `/api/admin/reports/export?${params}`;
    };

    useEffect(() => {
        fetchOptions();
    }, []);

    useEffect(() => {
        fetchLaporan();
    }, [filters]);

    useEffect(() => setStudentPage(1), [studentSearch, laporan]);

    // ---- Periode pills (murni frontend, tidak butuh backend) ----
    const applyPreset = (preset) => {
        const today = new Date();
        let start, end;
        if (preset === 'hari_ini') {
            start = end = today;
        } else if (preset === 'minggu_ini') {
            const day = today.getDay() || 7;
            start = new Date(today);
            start.setDate(today.getDate() - day + 1);
            end = today;
        } else if (preset === 'bulan_ini') {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = today;
        } else {
            setActivePreset('kustom');
            return;
        }
        setActivePreset(preset);
        setFilters((f) => ({ ...f, tanggal_mulai: toISO(start), tanggal_akhir: toISO(end) }));
    };

    const resetFilters = () => {
        setFilters(emptyFilters);
        setActivePreset('');
    };

    // ---- Agregasi dari data asli (bukan dummy) ----
    const agg = useMemo(() => {
        const total = laporan.length;
        const hadir = laporan.filter((r) => r.status === 'hadir').length;
        const izin = laporan.filter((r) => r.status === 'izin').length;
        const sakit = laporan.filter((r) => r.status === 'sakit').length;
        const alpa = laporan.filter((r) => r.status === 'alpa').length;
        const pctHadir = total ? (hadir / total) * 100 : 0;
        return { total, hadir, izin, sakit, alpa, pctHadir, tidakHadir: izin + sakit + alpa };
    }, [laporan]);

    const perKelas = useMemo(() => {
        const map = new Map();
        laporan.forEach((r) => {
            if (!map.has(r.kelas)) map.set(r.kelas, { kelas: r.kelas, total: 0, hadir: 0, izin: 0, sakit: 0, alpa: 0, records: [] });
            const g = map.get(r.kelas);
            g.total += 1;
            g[r.status] = (g[r.status] || 0) + 1;
            g.records.push(r);
        });
        return Array.from(map.values())
            .map((g) => ({ ...g, pct: g.total ? (g.hadir / g.total) * 100 : 0 }))
            .sort((a, b) => b.pct - a.pct);
    }, [laporan]);

    const perSiswa = useMemo(() => {
        const map = new Map();
        laporan.forEach((r) => {
            const key = r.nama_siswa;
            if (!map.has(key)) map.set(key, { nama: key, kelas: r.kelas, total: 0, hadir: 0, izin: 0, sakit: 0, alpa: 0, records: [] });
            const g = map.get(key);
            g.total += 1;
            g[r.status] = (g[r.status] || 0) + 1;
            g.kelas = r.kelas;
            g.records.push(r);
        });
        return Array.from(map.values()).map((g) => ({ ...g, pct: g.total ? (g.hadir / g.total) * 100 : 0 }));
    }, [laporan]);

    const filteredSiswa = useMemo(() => {
        const q = studentSearch.trim().toLowerCase();
        if (!q) return perSiswa;
        return perSiswa.filter((s) => s.nama.toLowerCase().includes(q));
    }, [perSiswa, studentSearch]);

    const studentTotalPages = Math.max(1, Math.ceil(filteredSiswa.length / STUDENT_PAGE_SIZE));
    const pagedSiswa = filteredSiswa.slice((studentPage - 1) * STUDENT_PAGE_SIZE, studentPage * STUDENT_PAGE_SIZE);

    const perTanggal = useMemo(() => {
        const map = new Map();
        laporan.forEach((r) => {
            if (!map.has(r.tanggal)) map.set(r.tanggal, { tanggal: r.tanggal, total: 0, hadir: 0, izin: 0, sakit: 0, alpa: 0 });
            const g = map.get(r.tanggal);
            g.total += 1;
            g[r.status] = (g[r.status] || 0) + 1;
        });
        return Array.from(map.values())
            .map((g) => ({ ...g, pct: g.total ? (g.hadir / g.total) * 100 : 0 }))
            .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    }, [laporan]);

    const maxBarTotal = Math.max(1, ...perTanggal.map((d) => d.total));

    const initials = (name) => name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#1F2937]">Laporan Absensi</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">
                        Pantau dan analisis rekap kehadiran siswa berdasarkan periode, kelas, dan mata pelajaran.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        disabled
                        title="Belum tersedia — backend hanya menyediakan export CSV"
                        className="h-9 px-3 border border-[#E5E7EB] bg-[#F5F7FA] text-[#9CA3AF] rounded-lg text-sm flex items-center gap-1.5 cursor-not-allowed"
                    >
                        <FileText size={16} className="text-red-400" />
                        <span>PDF</span>
                    </button>
                    <button
                        disabled
                        title="Belum tersedia — backend hanya menyediakan export CSV"
                        className="h-9 px-3 border border-[#E5E7EB] bg-[#F5F7FA] text-[#9CA3AF] rounded-lg text-sm flex items-center gap-1.5 cursor-not-allowed"
                    >
                        <FileSpreadsheet size={16} className="text-emerald-400" />
                        <span>Excel</span>
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="h-9 px-3 border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1F2937] rounded-lg text-sm flex items-center gap-1.5 transition-colors"
                    >
                        <Printer size={16} />
                        <span>Cetak</span>
                    </button>
                    <button
                        onClick={() => setExportModalOpen(true)}
                        className="h-9 px-4 text-white rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm"
                        style={{ background: NAVY }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = NAVY_HOVER)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = NAVY)}
                    >
                        <Download size={16} />
                        <span>Export Laporan</span>
                    </button>
                </div>
            </div>

            {/* FILTER PANEL */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-2 text-sm text-[#1F2937]">
                        <Filter size={16} className="text-[#9CA3AF]" />
                        <span>Filter Laporan</span>
                    </div>
                    <div className="inline-flex rounded-lg border border-[#E5E7EB] p-0.5 bg-[#F5F7FA] text-xs">
                        {[
                            ['hari_ini', 'Hari Ini'],
                            ['minggu_ini', 'Minggu Ini'],
                            ['bulan_ini', 'Bulan Ini'],
                            ['kustom', 'Kustom'],
                        ].map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => applyPreset(key)}
                                className={`px-3 py-1 rounded transition-colors ${
                                    activePreset === key
                                        ? 'text-white font-semibold'
                                        : 'text-[#6B7280] hover:text-[#1F2937]'
                                }`}
                                style={activePreset === key ? { background: NAVY } : undefined}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Tanggal Mulai</label>
                        <input
                            type="date"
                            value={filters.tanggal_mulai}
                            onChange={(e) => { setActivePreset('kustom'); setFilters({ ...filters, tanggal_mulai: e.target.value }); }}
                            className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-1"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Tanggal Akhir</label>
                        <input
                            type="date"
                            value={filters.tanggal_akhir}
                            onChange={(e) => { setActivePreset('kustom'); setFilters({ ...filters, tanggal_akhir: e.target.value }); }}
                            className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-1"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Kelas</label>
                        <select
                            value={filters.class_id}
                            onChange={(e) => setFilters({ ...filters, class_id: e.target.value })}
                            className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none"
                        >
                            <option value="">Semua Kelas</option>
                            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Mata Pelajaran</label>
                        <select
                            value={filters.subject_id}
                            onChange={(e) => setFilters({ ...filters, subject_id: e.target.value })}
                            className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none"
                        >
                            <option value="">Semua Mata Pelajaran</option>
                            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Status Kehadiran</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none"
                        >
                            <option value="">Semua Status</option>
                            <option value="hadir">Hadir</option>
                            <option value="izin">Izin</option>
                            <option value="sakit">Sakit</option>
                            <option value="alpa">Alpa</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                        onClick={resetFilters}
                        className="h-8 px-3 rounded-lg border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#6B7280] text-sm flex items-center gap-1.5 transition-colors"
                    >
                        <RotateCcw size={14} />
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-[#6B7280]">Total Kehadiran</p>
                            <h3 className="text-2xl font-semibold text-[#1F2937] mt-1">{agg.total.toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#EFF4FF', color: NAVY }}>
                            <ClipboardList size={18} />
                        </div>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-2">Total data kehadiran tercatat</p>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-[#6B7280]">Hadir</p>
                            <h3 className="text-2xl font-semibold text-emerald-700 mt-1">{agg.hadir.toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                            <CheckCircle2 size={18} />
                        </div>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-2">
                        <span className="font-semibold text-emerald-700">{agg.pctHadir.toFixed(1)}%</span> dari total kehadiran
                    </p>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-[#6B7280]">Tidak Hadir</p>
                            <h3 className="text-2xl font-semibold text-amber-700 mt-1">{agg.tidakHadir.toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                            <AlertCircle size={18} />
                        </div>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-2">
                        Izin <span className="font-medium text-amber-600">{agg.izin}</span>, Sakit{' '}
                        <span className="font-medium text-blue-600">{agg.sakit}</span>, Alpa{' '}
                        <span className="font-medium text-rose-600">{agg.alpa}</span>
                    </p>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-[#6B7280]">Persentase Kehadiran</p>
                            <h3 className="text-2xl font-semibold mt-1" style={{ color: NAVY }}>{agg.pctHadir.toFixed(1)}%</h3>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-2">Berdasarkan filter yang aktif saat ini</p>
                </div>
            </div>

            {/* TREN + DONUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-xl p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E7EB] gap-2">
                        <div>
                            <h2 className="text-base font-semibold" style={{ color: NAVY }}>Tren Kehadiran Harian</h2>
                            <p className="text-xs text-[#6B7280]">Berdasarkan rentang tanggal filter aktif</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs flex-wrap">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />Hadir</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />Izin</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />Sakit</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />Alpa</span>
                        </div>
                    </div>

                    {perTanggal.length === 0 ? (
                        <div className="py-14 text-center text-sm text-[#9CA3AF]">Tidak ada data untuk rentang ini.</div>
                    ) : (
                        <div className="pt-6 pb-2 overflow-x-auto">
                            <div className="h-48 flex items-end gap-3 px-1 min-w-[480px]">
                                {perTanggal.map((d) => {
                                    const h = Math.max(4, (d.total / maxBarTotal) * 100);
                                    return (
                                        <div key={d.tanggal} className="flex-1 flex flex-col items-center gap-2">
                                            <span className="text-[11px] font-semibold text-[#1F2937]">{d.pct.toFixed(0)}%</span>
                                            <div className="w-full max-w-[36px] rounded-t overflow-hidden bg-slate-100 flex flex-col justify-end" style={{ height: '160px' }}>
                                                <div className="w-full flex flex-col" style={{ height: `${h}%` }}>
                                                    <div className="w-full bg-rose-500" style={{ height: `${(d.alpa / d.total) * 100}%` }} />
                                                    <div className="w-full bg-blue-500" style={{ height: `${(d.sakit / d.total) * 100}%` }} />
                                                    <div className="w-full bg-amber-500" style={{ height: `${(d.izin / d.total) * 100}%` }} />
                                                    <div className="w-full bg-emerald-600 flex-1" />
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-[#6B7280] text-center">{fmtDate(d.tanggal)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    <div className="pt-3 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
                        Rata-rata kehadiran periode ini: <strong className="text-[#1F2937]">{agg.pctHadir.toFixed(1)}%</strong>
                    </div>
                </div>

                <div className="lg:col-span-4 bg-white border border-[#E5E7EB] rounded-xl p-5 flex flex-col justify-between">
                    <div className="pb-3 border-b border-[#E5E7EB]">
                        <h2 className="text-base font-semibold" style={{ color: NAVY }}>Distribusi Status Kehadiran</h2>
                        <p className="text-xs text-[#6B7280]">Proporsi status pada data hasil filter</p>
                    </div>
                    <div className="py-4 flex flex-col items-center justify-center">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F1F5F9" strokeWidth="3.8" />
                                {agg.total > 0 && (
                                    <>
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeDasharray={`${(agg.hadir / agg.total) * 100}, 100`} strokeLinecap="round" strokeWidth="3.8" />
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" strokeDasharray={`${(agg.izin / agg.total) * 100}, 100`} strokeDashoffset={`${-(agg.hadir / agg.total) * 100}`} strokeWidth="3.8" />
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeDasharray={`${(agg.sakit / agg.total) * 100}, 100`} strokeDashoffset={`${-((agg.hadir + agg.izin) / agg.total) * 100}`} strokeWidth="3.8" />
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ef4444" strokeDasharray={`${(agg.alpa / agg.total) * 100}, 100`} strokeDashoffset={`${-((agg.hadir + agg.izin + agg.sakit) / agg.total) * 100}`} strokeWidth="3.8" />
                                    </>
                                )}
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-xl font-bold" style={{ color: NAVY }}>{agg.pctHadir.toFixed(1)}%</span>
                                <span className="text-[10px] text-[#6B7280] uppercase">Hadir</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 border-t border-[#E5E7EB] pt-3 text-sm">
                        {[
                            ['Hadir', agg.hadir, 'bg-emerald-500'],
                            ['Izin', agg.izin, 'bg-amber-500'],
                            ['Sakit', agg.sakit, 'bg-blue-500'],
                            ['Alpa', agg.alpa, 'bg-rose-500'],
                        ].map(([label, val, dot]) => (
                            <div key={label} className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-[#1F2937]"><span className={`w-2.5 h-2.5 rounded-full ${dot}`} />{label}</span>
                                <span>
                                    <span className="font-semibold text-[#1F2937]">{val}</span>
                                    <span className="text-[#9CA3AF] text-xs ml-1">({agg.total ? ((val / agg.total) * 100).toFixed(1) : 0}%)</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* REKAP PER KELAS */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                <div className="p-4 border-b border-[#E5E7EB]">
                    <h2 className="text-base font-semibold" style={{ color: NAVY }}>Rekap Kehadiran per Kelas</h2>
                    <p className="text-xs text-[#6B7280]">Komparasi tingkat kehadiran antar kelas pada data hasil filter</p>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-[#9CA3AF] text-sm">Memuat data...</div>
                ) : perKelas.length === 0 ? (
                    <div className="p-8 text-center text-[#9CA3AF] text-sm">Tidak ada data untuk filter ini.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F5F7FA] border-b border-[#E5E7EB] text-[11px] uppercase tracking-wide text-[#6B7280]">
                                    <th className="py-2.5 px-4">Kelas</th>
                                    <th className="py-2.5 px-3">Total Data</th>
                                    <th className="py-2.5 px-3 text-center">Hadir</th>
                                    <th className="py-2.5 px-3 text-center">Izin</th>
                                    <th className="py-2.5 px-3 text-center">Sakit</th>
                                    <th className="py-2.5 px-3 text-center">Alpa</th>
                                    <th className="py-2.5 px-4">Persentase</th>
                                    <th className="py-2.5 px-4 text-center">Rating</th>
                                    <th className="py-2.5 px-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB] text-sm">
                                {perKelas.map((k) => {
                                    const rating = ratingBadge(k.pct);
                                    return (
                                        <tr key={k.kelas} className="hover:bg-[#F5F7FA]/60 transition-colors">
                                            <td className="py-2 px-4 font-semibold" style={{ color: NAVY }}>{k.kelas}</td>
                                            <td className="py-2 px-3 text-[#6B7280]">{k.total}</td>
                                            <td className="py-2 px-3 text-center font-medium text-emerald-700">{k.hadir || 0}</td>
                                            <td className="py-2 px-3 text-center text-amber-700">{k.izin || 0}</td>
                                            <td className="py-2 px-3 text-center text-blue-700">{k.sakit || 0}</td>
                                            <td className="py-2 px-3 text-center text-rose-700">{k.alpa || 0}</td>
                                            <td className="py-2 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-10 font-semibold text-[#1F2937]">{k.pct.toFixed(1)}%</span>
                                                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 max-w-[100px] overflow-hidden">
                                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${k.pct}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border uppercase ${rating.cls}`}>
                                                    {rating.label}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-right">
                                                <button onClick={() => setClassDetail(k)} title="Rincian Kelas" className="p-1 rounded text-[#9CA3AF] hover:text-[#1E3A5F] hover:bg-[#F5F7FA] transition-colors">
                                                    <ChevronRight size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* REKAP PER SISWA */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                <div className="p-4 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-base font-semibold" style={{ color: NAVY }}>Rekap Kehadiran Siswa</h2>
                        <p className="text-xs text-[#6B7280]">
                            Dikelompokkan berdasarkan nama siswa — NIS belum tersedia di data laporan, nama yang sama bisa tergabung
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full sm:w-64">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                            <input
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                placeholder="Cari nama siswa..."
                                className="w-full h-9 pl-8 pr-3 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none"
                            />
                        </div>
                        <span className="text-xs text-[#6B7280] whitespace-nowrap">
                            {filteredSiswa.length} siswa
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-[#9CA3AF] text-sm">Memuat data...</div>
                ) : filteredSiswa.length === 0 ? (
                    <div className="p-8 text-center text-[#9CA3AF] text-sm">Tidak ada data untuk filter ini.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F5F7FA] border-b border-[#E5E7EB] text-[11px] uppercase tracking-wide text-[#6B7280]">
                                    <th className="py-2.5 px-4">Nama Siswa</th>
                                    <th className="py-2.5 px-3">Kelas</th>
                                    <th className="py-2.5 px-3 text-center">Hadir</th>
                                    <th className="py-2.5 px-3 text-center">Izin</th>
                                    <th className="py-2.5 px-3 text-center">Sakit</th>
                                    <th className="py-2.5 px-3 text-center">Alpa</th>
                                    <th className="py-2.5 px-4">Persentase</th>
                                    <th className="py-2.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB] text-sm">
                                {pagedSiswa.map((s) => (
                                    <tr key={s.nama} className="hover:bg-[#F5F7FA]/60 transition-colors">
                                        <td className="py-2 px-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: NAVY }}>
                                                    {initials(s.nama)}
                                                </div>
                                                <span className="font-medium text-[#1F2937]">{s.nama}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 text-[#6B7280]">{s.kelas}</td>
                                        <td className="py-2 px-3 text-center font-semibold text-emerald-700">{s.hadir || 0}</td>
                                        <td className="py-2 px-3 text-center text-amber-700">{s.izin || 0}</td>
                                        <td className="py-2 px-3 text-center text-blue-700">{s.sakit || 0}</td>
                                        <td className="py-2 px-3 text-center text-rose-700">{s.alpa || 0}</td>
                                        <td className="py-2 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="w-10 font-semibold text-[#1F2937]">{s.pct.toFixed(0)}%</span>
                                                <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.pct}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2 px-4 text-right">
                                            <button onClick={() => setStudentDetail(s)} className="font-medium text-sm" style={{ color: NAVY }}>
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {filteredSiswa.length > 0 && studentTotalPages > 1 && (
                    <div className="p-3 border-t border-[#E5E7EB] flex items-center justify-between text-sm text-[#6B7280]">
                        <span>
                            Halaman <strong className="text-[#1F2937]">{studentPage}</strong> dari{' '}
                            <strong className="text-[#1F2937]">{studentTotalPages}</strong>
                        </span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setStudentPage((p) => Math.max(1, p - 1))} disabled={studentPage === 1} className="h-8 w-8 rounded border border-[#E5E7EB] flex items-center justify-center disabled:opacity-40 hover:bg-[#F5F7FA]">
                                <ChevronLeft size={14} />
                            </button>
                            <button onClick={() => setStudentPage((p) => Math.min(studentTotalPages, p + 1))} disabled={studentPage === studentTotalPages} className="h-8 w-8 rounded border border-[#E5E7EB] flex items-center justify-center disabled:opacity-40 hover:bg-[#F5F7FA]">
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL EXPORT */}
            {exportModalOpen && (
                <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl max-w-md w-full p-5">
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
                            <h3 className="text-base font-semibold text-[#1F2937]">Export Laporan Absensi</h3>
                            <button onClick={() => setExportModalOpen(false)} className="text-[#9CA3AF] hover:text-[#1F2937]"><X size={18} /></button>
                        </div>
                        <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Pilih Format Berkas</label>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {[
                                ['pdf', 'PDF', true],
                                ['excel', 'Excel', true],
                                ['csv', 'CSV', false],
                            ].map(([val, label, disabled]) => (
                                <label
                                    key={val}
                                    title={disabled ? 'Belum tersedia' : undefined}
                                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
                                        disabled ? 'opacity-40 cursor-not-allowed border-[#E5E7EB]' :
                                        exportFormat === val ? 'border-2' : 'border-[#E5E7EB]'
                                    }`}
                                    style={!disabled && exportFormat === val ? { borderColor: NAVY, background: '#EFF4FF' } : undefined}
                                >
                                    <input
                                        type="radio"
                                        disabled={disabled}
                                        checked={exportFormat === val}
                                        onChange={() => setExportFormat(val)}
                                    />
                                    <span className="text-sm font-medium text-[#1F2937]">{label}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                            <button onClick={() => setExportModalOpen(false)} className="h-9 px-4 rounded-lg border border-[#E5E7EB] text-[#1F2937] hover:bg-[#F5F7FA] text-sm">
                                Batal
                            </button>
                            <button
                                onClick={() => { handleExportCsv(); setExportModalOpen(false); }}
                                className="h-9 px-4 rounded-lg text-white text-sm flex items-center gap-2"
                                style={{ background: NAVY }}
                            >
                                <Download size={16} />
                                <span>Unduh File</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DETAIL KELAS */}
            {classDetail && (
                <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col p-5">
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-3">
                            <h3 className="text-base font-semibold text-[#1F2937]">Rincian Kelas {classDetail.kelas}</h3>
                            <button onClick={() => setClassDetail(null)} className="text-[#9CA3AF] hover:text-[#1F2937]"><X size={18} /></button>
                        </div>
                        <div className="overflow-y-auto space-y-2">
                            {classDetail.records.map((r) => (
                                <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E7EB] text-sm">
                                    <div>
                                        <p className="font-medium text-[#1F2937]">{r.nama_siswa}</p>
                                        <p className="text-xs text-[#6B7280]">{r.mata_pelajaran} · {fmtDate(r.tanggal)} · {r.waktu ?? '-'}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border capitalize ${statusBadge[r.status]}`}>{r.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DETAIL SISWA */}
            {studentDetail && (
                <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col p-5">
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-3">
                            <h3 className="text-base font-semibold text-[#1F2937]">Rincian {studentDetail.nama}</h3>
                            <button onClick={() => setStudentDetail(null)} className="text-[#9CA3AF] hover:text-[#1F2937]"><X size={18} /></button>
                        </div>
                        <div className="overflow-y-auto space-y-2">
                            {studentDetail.records.map((r) => (
                                <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E7EB] text-sm">
                                    <div>
                                        <p className="font-medium text-[#1F2937]">{r.mata_pelajaran}</p>
                                        <p className="text-xs text-[#6B7280]">{r.kelas} · {fmtDate(r.tanggal)} · {r.waktu ?? '-'}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border capitalize ${statusBadge[r.status]}`}>{r.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}