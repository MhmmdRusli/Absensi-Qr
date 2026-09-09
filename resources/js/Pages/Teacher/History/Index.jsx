import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Printer, Download, Search, RefreshCw, CalendarCheck, TrendingUp,
    Users2, UserX, X, ChevronLeft, ChevronRight, QrCode, SearchX,
} from 'lucide-react';
import api from '../../../Lib/axios';

const PAGE_SIZE = 6;

export default function TeacherHistory() {
    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);
    const [details, setDetails] = useState({}); // id -> { total_hadir, total_siswa, siswa }
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [kelasFilter, setKelasFilter] = useState('');
    const [mapelFilter, setMapelFilter] = useState('');
    const [pctFilter, setPctFilter] = useState('');
    const [sortBy, setSortBy] = useState('terbaru');
    const [page, setPage] = useState(1);

    const [detailSession, setDetailSession] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setErrorMsg(null);
            try {
                const res = await api.get('/teacher/sessions');
                const closed = (res.data.data || []).filter((s) => s.status === 'closed');
                setSessions(closed);

                const detailEntries = await Promise.all(
                    closed.map(async (s) => {
                        try {
                            const d = await api.get(`/teacher/sessions/${s.id}`);
                            return [s.id, d.data.data];
                        } catch {
                            return [s.id, null];
                        }
                    })
                );
                setDetails(Object.fromEntries(detailEntries));
            } catch (err) {
                setErrorMsg('Gagal memuat riwayat absensi.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const enriched = useMemo(() => {
        return sessions.map((s) => {
            const d = details[s.id];
            const total_siswa = d?.total_siswa ?? 0;
            const total_hadir = d?.total_hadir ?? 0;
            const pct = total_siswa ? (total_hadir / total_siswa) * 100 : 0;
            return { ...s, total_siswa, total_hadir, pct, siswa: d?.siswa ?? [] };
        });
    }, [sessions, details]);

    const kelasOptions = useMemo(() => [...new Set(sessions.map((s) => s.kelas))].sort(), [sessions]);
    const mapelOptions = useMemo(() => [...new Set(sessions.map((s) => s.mata_pelajaran))].sort(), [sessions]);

    const filtered = useMemo(() => {
        return enriched.filter((s) => {
            const matchSearch = search
                ? s.mata_pelajaran.toLowerCase().includes(search.toLowerCase()) ||
                  s.kelas.toLowerCase().includes(search.toLowerCase())
                : true;
            const matchFrom = dateFrom ? s.tanggal >= dateFrom : true;
            const matchTo = dateTo ? s.tanggal <= dateTo : true;
            const matchKelas = kelasFilter ? s.kelas === kelasFilter : true;
            const matchMapel = mapelFilter ? s.mata_pelajaran === mapelFilter : true;
            const matchPct = pctFilter === 'high' ? s.pct >= 95 : pctFilter === 'low' ? s.pct < 90 : true;
            return matchSearch && matchFrom && matchTo && matchKelas && matchMapel && matchPct;
        });
    }, [enriched, search, dateFrom, dateTo, kelasFilter, mapelFilter, pctFilter]);

    const sorted = useMemo(() => {
        const copy = [...filtered];
        copy.sort((a, b) => {
            if (sortBy === 'kehadiran_rendah') return a.pct - b.pct;
            if (sortBy === 'kehadiran_tinggi') return b.pct - a.pct;
            const aKey = `${a.tanggal} ${a.waktu_mulai}`;
            const bKey = `${b.tanggal} ${b.waktu_mulai}`;
            return sortBy === 'terbaru' ? bKey.localeCompare(aKey) : aKey.localeCompare(bKey);
        });
        return copy;
    }, [filtered, sortBy]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => setPage(1), [search, dateFrom, dateTo, kelasFilter, mapelFilter, pctFilter]);

    const summary = useMemo(() => {
        const withDetail = enriched.filter((s) => details[s.id]);
        const totalSesi = enriched.length;
        const rataKehadiran = withDetail.length
            ? withDetail.reduce((sum, s) => sum + s.pct, 0) / withDetail.length
            : 0;
        const akumulasiHadir = withDetail.reduce((sum, s) => sum + s.total_hadir, 0);
        const totalTidakHadir = withDetail.reduce((sum, s) => sum + (s.total_siswa - s.total_hadir), 0);
        return { totalSesi, rataKehadiran, akumulasiHadir, totalTidakHadir };
    }, [enriched, details]);

    const resetFilters = () => {
        setSearch(''); setDateFrom(''); setDateTo(''); setKelasFilter(''); setMapelFilter(''); setPctFilter('');
    };

    const fmtDate = (iso) =>
        new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));

    return (
        <>
            {/* PRINT-ONLY REKAP */}
            <div id="print-rekap" style={{ display: 'none' }}>
                <div className="px-6 py-4">
                    <h2 className="text-lg font-bold text-[#1E3A5F] mb-1">Rekap Riwayat Absensi</h2>
                    <p className="text-xs text-[#6B7280] mb-4">
                        Dicetak pada: {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date())}
                    </p>

                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-[#E5E7EB] text-xs uppercase tracking-wide text-[#6B7280]">
                                <th className="py-2 px-3">Mata Pelajaran</th>
                                <th className="py-2 px-3">Kelas</th>
                                <th className="py-2 px-3">Tanggal</th>
                                <th className="py-2 px-3">Waktu</th>
                                <th className="py-2 px-3 text-center">Hadir</th>
                                <th className="py-2 px-3 text-center">Izin</th>
                                <th className="py-2 px-3 text-center">Sakit</th>
                                <th className="py-2 px-3 text-center">Alpa</th>
                                <th className="py-2 px-3 text-center">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E7EB]">
                            {sorted.map((item) => {
                                const d = item.detail;
                                const siswa = d?.siswa ?? [];
                                const hadir = siswa.filter((s) => s.status === 'hadir').length;
                                const izin = siswa.filter((s) => s.status === 'izin').length;
                                const sakit = siswa.filter((s) => s.status === 'sakit').length;
                                const alpa = siswa.filter((s) => s.status === 'alpa').length;
                                const total = hadir + izin + sakit + alpa;
                                return (
                                    <tr key={item.id} className="text-sm">
                                        <td className="py-2 px-3 font-medium">{item.mata_pelajaran}</td>
                                        <td className="py-2 px-3">{item.kelas}</td>
                                        <td className="py-2 px-3">{fmtDate(item.tanggal)}</td>
                                        <td className="py-2 px-3">{item.waktu_mulai} - {item.waktu_selesai}</td>
                                        <td className="py-2 px-3 text-center text-emerald-700">{hadir}</td>
                                        <td className="py-2 px-3 text-center text-amber-700">{izin}</td>
                                        <td className="py-2 px-3 text-center text-blue-700">{sakit}</td>
                                        <td className="py-2 px-3 text-center text-rose-700">{alpa}</td>
                                        <td className="py-2 px-3 text-center font-semibold">{total}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="space-y-5">
                {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-[#1E3A5F] tracking-tight">Riwayat Absensi</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">
                        Arsip dan rekapitulasi sesi absensi yang telah diselenggarakan.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1F2937] text-xs font-semibold rounded-lg transition-colors print:hidden"
                    >
                        <Printer size={16} />
                        <span>Cetak Rekap</span>
                    </button>
                    <button
                        disabled
                        title="Belum tersedia — backend belum punya endpoint export"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F5F7FA] border border-[#E5E7EB] text-[#9CA3AF] text-xs font-semibold rounded-lg cursor-not-allowed"
                    >
                        <Download size={16} />
                        <span>Unduh Laporan</span>
                    </button>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-[#6B7280]">Total Sesi Terlaksana</span>
                        <CalendarCheck size={16} className="text-[#1E3A5F]" />
                    </div>
                    <p className="text-2xl font-bold text-[#1F2937] mt-2">{summary.totalSesi} <span className="text-sm font-normal text-[#6B7280]">Sesi</span></p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-[#6B7280]">Rata-rata Kehadiran</span>
                        <TrendingUp size={16} className="text-[#1E3A5F]" />
                    </div>
                    <p className="text-2xl font-bold text-[#1E3A5F] mt-2">{summary.rataKehadiran.toFixed(1)}%</p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-[#6B7280]">Akumulasi Hadir</span>
                        <Users2 size={16} className="text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-700 mt-2">{summary.akumulasiHadir} <span className="text-sm font-normal text-[#6B7280]">Siswa</span></p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-[#6B7280]">Total Tidak Hadir</span>
                        <UserX size={16} className="text-[#9CA3AF]" />
                    </div>
                    <p className="text-2xl font-bold text-[#1F2937] mt-2">{summary.totalTidakHadir} <span className="text-sm font-normal text-[#6B7280]">Siswa</span></p>
                </div>
            </div>

            {/* FILTER TOOLBAR */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <div className="md:col-span-3 relative">
                        <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari mata pelajaran / kelas..."
                            className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-[#E5E7EB] rounded text-[#1F2937] focus:outline-none focus:border-[#1E3A5F]"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full h-9 px-2 text-xs bg-white border border-[#E5E7EB] rounded focus:outline-none focus:border-[#1E3A5F]" />
                    </div>
                    <div className="md:col-span-2">
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                            className="w-full h-9 px-2 text-xs bg-white border border-[#E5E7EB] rounded focus:outline-none focus:border-[#1E3A5F]" />
                    </div>
                    <div className="md:col-span-2">
                        <select value={kelasFilter} onChange={(e) => setKelasFilter(e.target.value)}
                            className="w-full h-9 px-2 text-xs bg-white border border-[#E5E7EB] rounded focus:outline-none focus:border-[#1E3A5F]">
                            <option value="">Semua Kelas</option>
                            {kelasOptions.map((k) => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <select value={pctFilter} onChange={(e) => setPctFilter(e.target.value)}
                            className="w-full h-9 px-2 text-xs bg-white border border-[#E5E7EB] rounded focus:outline-none focus:border-[#1E3A5F]">
                            <option value="">Semua Status</option>
                            <option value="high">Kehadiran ≥95%</option>
                            <option value="low">Kehadiran &lt;90%</option>
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <button onClick={resetFilters}
                            className="w-full h-9 flex items-center justify-center gap-1 border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#6B7280] rounded text-[11px] font-medium">
                            <RefreshCw size={13} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
                {mapelOptions.length > 0 && (
                    <div className="mt-2">
                        <select value={mapelFilter} onChange={(e) => setMapelFilter(e.target.value)}
                            className="h-9 px-2 text-xs bg-white border border-[#E5E7EB] rounded focus:outline-none focus:border-[#1E3A5F]">
                            <option value="">Semua Mata Pelajaran</option>
                            {mapelOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* TABLE */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1F2937]">Daftar Riwayat Sesi</span>
                        <span className="px-2 py-0.5 bg-[#F5F7FA] text-[#1E3A5F] rounded-full text-[11px] font-semibold">{sorted.length} Sesi</span>
                    </div>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                        className="border border-[#E5E7EB] rounded text-[11px] py-1 px-2 focus:outline-none focus:border-[#1E3A5F]">
                        <option value="terbaru">Tanggal Terkini</option>
                        <option value="terlama">Tanggal Terlama</option>
                        <option value="kehadiran_rendah">Kehadiran Terendah</option>
                        <option value="kehadiran_tinggi">Kehadiran Tertinggi</option>
                    </select>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-[#6B7280] text-sm">Memuat riwayat...</div>
                ) : errorMsg ? (
                    <div className="p-10 text-center text-red-600 text-sm">{errorMsg}</div>
                ) : sorted.length === 0 ? (
                    <div className="p-10 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#F5F7FA] text-[#9CA3AF] flex items-center justify-center mb-3">
                            <SearchX size={22} />
                        </div>
                        <h3 className="text-sm font-semibold text-[#1F2937]">Tidak Ada Riwayat Cocok</h3>
                        <p className="text-xs text-[#6B7280] max-w-xs mt-1 mb-4">
                            {sessions.length === 0
                                ? 'Belum ada sesi absensi yang selesai/ditutup.'
                                : 'Tidak ditemukan sesi sesuai filter atau kata kunci.'}
                        </p>
                        {sessions.length > 0 && (
                            <button onClick={resetFilters}
                                className="px-4 py-1.5 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-xs font-semibold rounded-lg">
                                Reset Semua Filter
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#F5F7FA] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                                        <th className="py-2.5 px-3 w-10 text-center">No</th>
                                        <th className="py-2.5 px-3">Tanggal & Waktu</th>
                                        <th className="py-2.5 px-3">Mata Pelajaran</th>
                                        <th className="py-2.5 px-3">Kelas</th>
                                        <th className="py-2.5 px-3 w-36">Kehadiran</th>
                                        <th className="py-2.5 px-3">Metode</th>
                                        <th className="py-2.5 px-3 text-center">Status</th>
                                        <th className="py-2.5 px-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB] text-xs text-[#1F2937]">
                                    {paginated.map((s, i) => (
                                        <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                                            <td className="py-2.5 px-3 text-center text-[#9CA3AF]">{(page - 1) * PAGE_SIZE + i + 1}</td>
                                            <td className="py-2.5 px-3">
                                                <div className="font-medium">{fmtDate(s.tanggal)}</div>
                                                <div className="text-[#9CA3AF] text-[11px] font-mono">{s.waktu_mulai} - {s.waktu_selesai}</div>
                                            </td>
                                            <td className="py-2.5 px-3 font-semibold text-[#1E3A5F]">{s.mata_pelajaran}</td>
                                            <td className="py-2.5 px-3 font-medium">{s.kelas}</td>
                                            <td className="py-2.5 px-3">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[11px] font-semibold">
                                                        <span>{s.total_hadir}/{s.total_siswa}</span>
                                                        <span className="text-[#1E3A5F]">{s.pct.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 overflow-hidden">
                                                        <div className="h-1.5 rounded-full bg-[#1E3A5F]" style={{ width: `${s.pct}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 text-[#6B7280]">
                                                <span className="inline-flex items-center gap-1"><QrCode size={13} className="text-[#1E3A5F]" />QR</span>
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">Selesai</span>
                                            </td>
                                            <td className="py-2.5 px-3 text-right">
                                                <button onClick={() => setDetailSession(s)}
                                                    className="px-2.5 py-1 bg-[#F5F7FA] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white rounded text-[11px] font-medium transition-colors">
                                                    Lihat Rincian
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-[#E5E7EB] gap-3">
                                <p className="text-xs text-[#6B7280]">
                                    Menampilkan <span className="font-semibold text-[#1F2937]">{(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, sorted.length)}</span> dari <span className="font-semibold text-[#1F2937]">{sorted.length}</span> riwayat sesi
                                </p>
                                <div className="flex items-center gap-1">
                                    <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        className="px-2.5 py-1 text-xs border border-[#E5E7EB] rounded hover:bg-[#F5F7FA] disabled:opacity-40 flex items-center gap-1">
                                        <ChevronLeft size={14} /> Sebelumnya
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button key={p} onClick={() => setPage(p)}
                                            className={`w-7 h-7 text-xs font-semibold rounded ${p === page ? 'bg-[#1E3A5F] text-white' : 'border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1F2937]'}`}>
                                            {p}
                                        </button>
                                    ))}
                                    <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        className="px-2.5 py-1 text-xs border border-[#E5E7EB] rounded hover:bg-[#F5F7FA] disabled:opacity-40 flex items-center gap-1">
                                        Berikutnya <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* MODAL DETAIL SESI (data asli dari GET /teacher/sessions/:id) */}
            {detailSession && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setDetailSession(null)}>
                    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 bg-[#1E3A5F] text-white flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-sm font-bold">{detailSession.mata_pelajaran} ({detailSession.kelas})</h3>
                                <p className="text-[11px] text-white/80">
                                    {fmtDate(detailSession.tanggal)} • {detailSession.waktu_mulai}-{detailSession.waktu_selesai} WIB
                                </p>
                            </div>
                            <button onClick={() => setDetailSession(null)} className="text-white/80 hover:text-white"><X size={18} /></button>
                        </div>
                        <div className="px-4 py-2.5 border-b border-[#E5E7EB] flex flex-wrap items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F5F7FA] text-[#1F2937] border border-[#E5E7EB]">Total: {detailSession.total_siswa}</span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Hadir: {detailSession.total_hadir}</span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">Tidak Hadir: {detailSession.total_siswa - detailSession.total_hadir}</span>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-[#F5F7FA]">
                                    <tr className="border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase">
                                        <th className="py-2 px-4">Nama Siswa</th>
                                        <th className="py-2 px-4">Jam Scan</th>
                                        <th className="py-2 px-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB]">
                                    {detailSession.siswa.map((s, idx) => (
                                        <tr key={idx} className="hover:bg-[#F8FAFC]">
                                            <td className="py-2 px-4 font-medium text-[#1F2937]">{s.nama}</td>
                                            <td className="py-2 px-4 font-mono text-[#6B7280]">{s.waktu ?? '-'}</td>
                                            <td className="py-2 px-4 text-right">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                                                    s.status === 'hadir' ? 'bg-emerald-50 text-emerald-700' : 'bg-[#F3F4F6] text-[#6B7280]'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'hadir' ? 'bg-emerald-500' : 'bg-[#9CA3AF]'}`} />
                                                    {s.status === 'hadir' ? 'Hadir' : 'Belum'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 py-3 border-t border-[#E5E7EB] flex justify-end shrink-0">
                            <button
                                onClick={() => navigate(`/teacher/sessions/${detailSession.id}`)}
                                className="px-4 py-1.5 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-xs font-semibold rounded-lg"
                            >
                                Buka Halaman Penuh
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </>
    );
}