import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
    Plus,
    Printer,
    Search,
    RefreshCw,
    CalendarDays,
    Radio,
    Clock3,
    CheckCircle2,
    CalendarX,
    X,
    Monitor,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import api from '../../../Lib/axios';

const PAGE_SIZE = 5;

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

export default function SessionIndex() {
    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    const [details, setDetails] = useState({}); // id -> { total_hadir, total_siswa }

    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [kelasFilter, setKelasFilter] = useState('');
    const [mapelFilter, setMapelFilter] = useState('');
    const [sortBy, setSortBy] = useState('terbaru');
    const [page, setPage] = useState(1);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [qrModalSessionId, setQrModalSessionId] = useState(null);

    const fetchSessions = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const response = await api.get('/teacher/sessions');
            const all = response.data.data || [];
            const activeOnly = all.filter((s) => s.status === 'active');
            setSessions(activeOnly);
        } catch (err) {
            setErrorMsg('Gagal memuat sesi absensi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    // Filter (client-side, sesi aktif saja)
    const filtered = useMemo(() => {
        return sessions.filter((s) => {
            const matchSearch = search
                ? (s.mata_pelajaran || '').toLowerCase().includes(search.toLowerCase()) ||
                  (s.kelas || '').toLowerCase().includes(search.toLowerCase())
                : true;
            const matchDate = dateFilter ? s.tanggal === dateFilter : true;
            const matchKelas = kelasFilter ? s.kelas === kelasFilter : true;
            const matchMapel = mapelFilter ? s.mata_pelajaran === mapelFilter : true;
            return matchSearch && matchDate && matchKelas && matchMapel;
        });
    }, [sessions, search, dateFilter, kelasFilter, mapelFilter]);

    const sorted = useMemo(() => {
        const copy = [...filtered];
        copy.sort((a, b) => {
            const aKey = `${a.tanggal} ${a.waktu_mulai}`;
            const bKey = `${b.tanggal} ${b.waktu_mulai}`;
            return sortBy === 'terbaru' ? bKey.localeCompare(aKey) : aKey.localeCompare(bKey);
        });
        return copy;
    }, [filtered, sortBy]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const kelasOptions = useMemo(() => [...new Set(sessions.map((s) => s.kelas))].sort(), [sessions]);
    const mapelOptions = useMemo(() => [...new Set(sessions.map((s) => s.mata_pelajaran))].sort(), [sessions]);

    // Fetch detail kehadiran hanya untuk baris yang sedang tampil
    useEffect(() => {
        paginated.forEach((s) => {
            if (details[s.id] === undefined) {
                setDetails((prev) => ({ ...prev, [s.id]: 'loading' }));
                api
                    .get(`/teacher/sessions/${s.id}`)
                    .then((res) => {
                        const d = res.data.data;
                        setDetails((prev) => ({
                            ...prev,
                            [s.id]: { total_hadir: d.total_hadir, total_siswa: d.total_siswa },
                        }));
                    })
                    .catch(() => {
                        setDetails((prev) => ({ ...prev, [s.id]: null }));
                    });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, sessions]);

    const summary = useMemo(() => {
        const total = sessions.length;
        const aktif = sessions.filter((s) => s.status === 'active').length;
        return { total, aktif };
    }, [sessions]);

    const handleResetFilter = () => {
        setSearch('');
        setDateFilter('');
        setKelasFilter('');
        setMapelFilter('');
        setPage(1);
    };

    const handleTutupSesi = async (id) => {
        if (!confirm('Tutup sesi absensi ini? Siswa tidak akan bisa scan QR lagi setelah ditutup.')) {
            return;
        }
        await api.post(`/teacher/sessions/${id}/close`);
        setDetails((prev) => ({ ...prev, [id]: undefined }));
        await fetchSessions();
    };

    const handleSessionCreated = async (newId) => {
        setShowCreateModal(false);
        await fetchSessions();
        setQrModalSessionId(newId);
    };

    const today = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <div className="space-y-5">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-[#1E3A5F] tracking-tight">Sesi Absensi</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">
                        Kelola dan lihat daftar sesi absensi yang telah dibuat.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        disabled
                        title="Fitur belum tersedia"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E7EB] text-[#9CA3AF] text-xs font-semibold rounded-lg cursor-not-allowed"
                    >
                        <Printer size={16} />
                        <span>Export / Cetak</span>
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                    >
                        <Plus size={16} />
                        <span>Buat Sesi Absensi</span>
                    </button>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-[#6B7280]">Total Sesi Aktif</span>
                        <CalendarDays size={16} className="text-[#1E3A5F]" />
                    </div>
                    <p className="text-2xl font-bold text-[#1F2937] mt-2">{summary.total} <span className="text-sm font-normal text-[#6B7280]">Sesi</span></p>
                </div>
                <div className="bg-white border border-[#E5E7EB] border-l-4 border-l-emerald-500 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-[#6B7280]">Sesi Aktif</span>
                        <Radio size={16} className="text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-700 mt-2">{summary.aktif} <span className="text-sm font-normal text-[#6B7280]">Sesi</span></p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-[#6B7280]">Sesi Selesai</span>
                        <CheckCircle2 size={16} className="text-[#9CA3AF]" />
                    </div>
                    <p className="text-2xl font-bold text-[#9CA3AF] mt-2">-</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">Lihat di Riwayat</p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-[#6B7280]">Sesi Hari Ini</span>
                        <Clock3 size={16} className="text-[#1E3A5F]" />
                    </div>
                    <p className="text-2xl font-bold text-[#1F2937] mt-2">-</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">Fitur belum didukung</p>
                </div>
            </div>

            {/* FILTER TOOLBAR */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <div className="md:col-span-4 relative">
                        <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                            placeholder="Cari mata pelajaran atau kelas..."
                            className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-[#E5E7EB] rounded text-[#1F2937] focus:outline-none focus:border-[#1E3A5F]"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => { setPage(1); setDateFilter(e.target.value); }}
                            className="w-full h-9 px-2 text-xs bg-white border border-[#E5E7EB] rounded focus:outline-none focus:border-[#1E3A5F]"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <select
                            value={kelasFilter}
                            onChange={(e) => { setPage(1); setKelasFilter(e.target.value); }}
                            className="w-full h-9 px-2 text-xs bg-white border border-[#E5E7EB] rounded focus:outline-none focus:border-[#1E3A5F]"
                        >
                            <option value="">Semua Kelas</option>
                            {kelasOptions.map((k) => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <select
                            value={mapelFilter}
                            onChange={(e) => { setPage(1); setMapelFilter(e.target.value); }}
                            className="w-full h-9 px-2 text-xs bg-white border border-[#E5E7EB] rounded focus:outline-none focus:border-[#1E3A5F]"
                        >
                            <option value="">Semua Mapel</option>
                            {mapelOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <button
                            onClick={handleResetFilter}
                            className="w-full h-9 flex items-center justify-center gap-1 border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#6B7280] rounded text-[11px] font-medium"
                        >
                            <RefreshCw size={13} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1F2937]">Daftar Sesi Absensi</span>
                    <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
                        <span>Urutkan:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-[#E5E7EB] rounded text-[11px] py-1 px-2 focus:outline-none focus:border-[#1E3A5F]"
                        >
                            <option value="terbaru">Waktu Terbaru</option>
                            <option value="terlama">Waktu Terlama</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-[#6B7280] text-sm">Memuat data...</div>
                ) : errorMsg ? (
                    <div className="p-10 text-center text-red-600 text-sm">{errorMsg}</div>
                ) : sorted.length === 0 ? (
                    <div className="p-10 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#F5F7FA] text-[#1E3A5F] flex items-center justify-center mb-3">
                            <CalendarX size={22} />
                        </div>
                        <h3 className="text-sm font-semibold text-[#1F2937]">Belum Ada Sesi Aktif</h3>
                        <p className="text-xs text-[#6B7280] max-w-xs mt-1 mb-4">
                            Belum terdapat sesi absensi aktif saat ini. Sesi yang sudah selesai dapat dilihat pada menu Riwayat.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-1.5 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                            >
                                <Plus size={14} />
                                <span>Buat Sesi Absensi</span>
                            </button>
                            {(search || dateFilter || kelasFilter || mapelFilter) && (
                                <button
                                    onClick={handleResetFilter}
                                    className="px-4 py-1.5 bg-white border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1F2937] text-xs font-semibold rounded-lg"
                                >
                                    Reset Filter
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#F5F7FA] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                                        <th className="py-2.5 px-3">Mata Pelajaran</th>
                                        <th className="py-2.5 px-3">Kelas</th>
                                        <th className="py-2.5 px-3">Ruangan</th>
                                        <th className="py-2.5 px-3">Tanggal</th>
                                        <th className="py-2.5 px-3">Waktu</th>
                                        <th className="py-2.5 px-3 w-36">Kehadiran</th>
                                        <th className="py-2.5 px-3 text-center">Status</th>
                                        <th className="py-2.5 px-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB] text-xs text-[#1F2937]">
                                    {paginated.map((s) => {
                                        const d = details[s.id];
                                        const pct = d && d !== 'loading' && d.total_siswa
                                            ? ((d.total_hadir / d.total_siswa) * 100).toFixed(0)
                                            : null;
                                        return (
                                            <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                                                <td className="py-2.5 px-3 font-semibold text-[#1E3A5F]">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        {s.mata_pelajaran}
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3 font-medium">{s.kelas}</td>
                                                <td className="py-2.5 px-3 text-[#6B7280]">-</td>
                                                <td className="py-2.5 px-3 text-[#6B7280]">
                                                    {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(s.tanggal))}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono text-[11px] text-[#6B7280]">
                                                    {s.waktu_mulai} - {s.waktu_selesai}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    {d === 'loading' || d === undefined ? (
                                                        <span className="text-[11px] text-[#9CA3AF]">Memuat...</span>
                                                    ) : d === null ? (
                                                        <span className="text-[11px] text-[#9CA3AF]">-</span>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-[11px] font-semibold">
                                                                <span>{d.total_hadir}/{d.total_siswa} Siswa</span>
                                                                <span className="text-emerald-600">{pct}%</span>
                                                            </div>
                                                            <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 overflow-hidden">
                                                                <div
                                                                    className="h-1.5 rounded-full bg-emerald-500"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        Aktif
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => navigate(`/teacher/sessions/${s.id}`)}
                                                            className="px-2 py-1 bg-[#1E3A5F] text-white hover:bg-[#16304F] rounded text-[11px] font-medium"
                                                        >
                                                            Monitoring
                                                        </button>
                                                        <button
                                                            onClick={() => setQrModalSessionId(s.id)}
                                                            title="Tampilkan QR"
                                                            className="px-2 py-1 bg-white border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1F2937] rounded text-[11px]"
                                                        >
                                                            <Monitor size={13} className="inline" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleTutupSesi(s.id)}
                                                            className="px-2 py-1 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 rounded text-[11px] font-medium"
                                                        >
                                                            Tutup
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-[#E5E7EB] gap-3">
                            <p className="text-xs text-[#6B7280]">
                                Menampilkan <span className="font-semibold text-[#1F2937]">{(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, sorted.length)}</span> dari <span className="font-semibold text-[#1F2937]">{sorted.length}</span> sesi
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="px-2.5 py-1 text-xs border border-[#E5E7EB] rounded hover:bg-[#F5F7FA] disabled:opacity-40 flex items-center gap-1"
                                >
                                    <ChevronLeft size={14} /> Sebelumnya
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-7 h-7 text-xs font-semibold rounded ${p === page ? 'bg-[#1E3A5F] text-white' : 'border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1F2937]'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className="px-2.5 py-1 text-xs border border-[#E5E7EB] rounded hover:bg-[#F5F7FA] disabled:opacity-40 flex items-center gap-1"
                                >
                                    Berikutnya <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {showCreateModal && (
                <CreateSessionModal onClose={() => setShowCreateModal(false)} onCreated={handleSessionCreated} />
            )}
            {qrModalSessionId && (
                <QrModal sessionId={qrModalSessionId} onClose={() => setQrModalSessionId(null)} onClosed={fetchSessions} />
            )}
        </div>
    );
}

function CreateSessionModal({ onClose, onCreated }) {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [form, setForm] = useState({ class_id: '', subject_id: '', date: todayStr(), start_time: '', end_time: '' });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        Promise.all([api.get('/classes-list'), api.get('/subjects-list')]).then(([c, s]) => {
            setClasses(c.data.data || []);
            setSubjects(s.data.data || []);
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);
        try {
            const response = await api.post('/teacher/sessions', form);
            onCreated(response.data.data.id);
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-lg border border-[#E5E7EB] shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-4 py-3 bg-[#1E3A5F] text-white flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2"><Plus size={18} /> Buat Sesi Absensi Baru</h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">Mata Pelajaran</label>
                        <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="w-full h-9 rounded border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#1E3A5F]">
                            <option value="">Pilih mata pelajaran</option>
                            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        {errors.subject_id && <p className="text-[11px] text-red-600 mt-1">{errors.subject_id[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">Kelas</label>
                        <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className="w-full h-9 rounded border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#1E3A5F]">
                            <option value="">Pilih kelas</option>
                            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors.class_id && <p className="text-[11px] text-red-600 mt-1">{errors.class_id[0]}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">Waktu Mulai</label>
                            <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="w-full h-9 rounded border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#1E3A5F]" />
                            {errors.start_time && <p className="text-[11px] text-red-600 mt-1">{errors.start_time[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">Waktu Selesai</label>
                            <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="w-full h-9 rounded border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#1E3A5F]" />
                            {errors.end_time && <p className="text-[11px] text-red-600 mt-1">{errors.end_time[0]}</p>}
                        </div>
                    </div>
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5E7EB]">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1F2937] text-sm font-medium rounded-lg">Batal</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                            {isSubmitting ? 'Memproses...' : 'Aktifkan Sesi Sekarang'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function QrModal({ sessionId, onClose, onClosed }) {
    const [session, setSession] = useState(null);
    const [isClosing, setIsClosing] = useState(false);

    const fetchSession = async () => {
        try {
            const res = await api.get(`/teacher/sessions/${sessionId}`);
            setSession(res.data.data);
        } catch (err) {}
    };

    useEffect(() => {
        fetchSession();
        const interval = setInterval(fetchSession, 5000);
        return () => clearInterval(interval);
    }, [sessionId]);

    const handleTutup = async () => {
        if (!confirm('Tutup sesi absensi ini?')) return;
        setIsClosing(true);
        try {
            await api.post(`/teacher/sessions/${sessionId}/close`);
            await fetchSession();
            await onClosed();
        } finally {
            setIsClosing(false);
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
                            <p className="text-[11px] text-white/80">{session.mata_pelajaran} • {session.kelas}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><X size={18} /></button>
                </div>
                <div className="p-5 text-center space-y-4">
                    {session.status === 'active' ? (
                        <div className="inline-block bg-[#F8FAFC] p-3 rounded-xl border border-[#E5E7EB]">
                            <QRCodeSVG value={session.qr_token} size={220} />
                        </div>
                    ) : (
                        <p className="text-[#9CA3AF] py-10 text-sm">QR tidak lagi ditampilkan — sesi sudah ditutup.</p>
                    )}
                    <div className="flex items-center justify-center gap-6 text-[12px] text-[#6B7280]">
                        <span>Hadir: <strong className="text-emerald-600">{session.total_hadir}</strong> / {session.total_siswa}</span>
                        <span>{session.waktu_mulai} - {session.waktu_selesai} WIB</span>
                    </div>
                    {session.status === 'active' && (
                        <button onClick={handleTutup} disabled={isClosing} className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-sm font-semibold rounded-lg disabled:opacity-50">
                            {isClosing ? 'Menutup...' : 'Tutup Sesi'}
                        </button>
                    )}
                </div>
                <div className="px-4 py-3 border-t border-[#E5E7EB] flex justify-end">
                    <button onClick={onClose} className="px-4 py-1.5 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-sm font-semibold rounded-lg">Tutup Pratinjau</button>
                </div>
            </div>
        </div>
    );
}