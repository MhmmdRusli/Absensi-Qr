import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    RefreshCw,
    Download,
    Eye,
    X,
    History as HistoryIcon,
    SearchX,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    QrCode,
    ReceiptText,
} from 'lucide-react';
import api from '../../Lib/axios';

const ITEMS_PER_PAGE = 6;

const STATUS_BADGE = {
    hadir: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    izin: 'bg-amber-50 text-amber-700 border border-amber-200',
    sakit: 'bg-blue-50 text-blue-700 border border-blue-200',
    alpa: 'bg-red-50 text-red-700 border border-red-200',
};

const STATUS_DOT = {
    hadir: 'bg-emerald-500',
    izin: 'bg-amber-500',
    sakit: 'bg-blue-500',
    alpa: 'bg-red-500',
};

const STATUS_LABEL = {
    hadir: 'HADIR',
    izin: 'IZIN',
    sakit: 'SAKIT',
    alpa: 'ALPA',
};

function formatTanggalHari(dateStr) {
    if (!dateStr) return { tanggal: '-', hari: '-' };
    const d = new Date(dateStr);
    const tanggal = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(d);
    const hari = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(d);
    return { tanggal, hari };
}

function formatBulanLabel(bulanValue) {
    if (!bulanValue) return null;
    const d = new Date(`${bulanValue}-01`);
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(d);
}

const emptyFilters = { bulan: '', status: '', subject_id: '' };
const emptyClientFilters = { search: '', dateFrom: '', dateTo: '' };

export default function History() {
    const navigate = useNavigate();

    const [riwayat, setRiwayat] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    // Filter server-side (real, dipicu tombol "Terapkan Filter")
    const [draftFilters, setDraftFilters] = useState(emptyFilters);
    const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

    // Filter client-side (search & rentang tanggal, langsung aktif)
    const [clientFilters, setClientFilters] = useState(emptyClientFilters);

    const [page, setPage] = useState(1);
    const [selectedDetail, setSelectedDetail] = useState(null);

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/subjects-list');
            setSubjects(response.data.data || []);
        } catch (err) {
            // Non-fatal — dropdown mapel cukup kosong kalau gagal
        }
    };

    const fetchRiwayat = async (params) => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const response = await api.get('/student/attendance/history', { params });
            setRiwayat(response.data.data || []);
        } catch (err) {
            setErrorMsg('Gagal memuat riwayat absensi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        fetchRiwayat(appliedFilters);
    }, [appliedFilters]);

    const handleTerapkanFilter = () => {
        setPage(1);
        setAppliedFilters(draftFilters);
    };

    const handleResetSemua = () => {
        setDraftFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
        setClientFilters(emptyClientFilters);
        setPage(1);
    };

    const handleSegarkan = () => {
        fetchSubjects();
        fetchRiwayat(appliedFilters);
    };

    // Ringkasan (dihitung dari data yang sudah ter-fetch sesuai filter server aktif)
    const summary = useMemo(() => {
        const total = riwayat.length;
        const hadir = riwayat.filter((r) => r.status === 'hadir').length;
        const izin = riwayat.filter((r) => r.status === 'izin').length;
        const sakit = riwayat.filter((r) => r.status === 'sakit').length;
        const alpa = riwayat.filter((r) => r.status === 'alpa').length;

        const alpaRecords = riwayat
            .filter((r) => r.status === 'alpa')
            .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        const lastAlpa = alpaRecords[0] || null;

        const pct = (n) => (total > 0 ? ((n / total) * 100).toFixed(1) : '0.0');

        return { total, hadir, izin, sakit, alpa, lastAlpa, pctHadir: pct(hadir), pctIzin: pct(izin), pctSakit: pct(sakit) };
    }, [riwayat]);

    // Filter client-side: search teks & rentang tanggal
    const filteredRiwayat = useMemo(() => {
        return riwayat.filter((item) => {
            const matchSearch = clientFilters.search
                ? (item.mata_pelajaran || '').toLowerCase().includes(clientFilters.search.toLowerCase())
                : true;

            const itemDate = item.tanggal ? new Date(item.tanggal) : null;
            const matchFrom = clientFilters.dateFrom && itemDate ? itemDate >= new Date(clientFilters.dateFrom) : true;
            const matchTo = clientFilters.dateTo && itemDate ? itemDate <= new Date(clientFilters.dateTo) : true;

            return matchSearch && matchFrom && matchTo;
        });
    }, [riwayat, clientFilters]);

    const totalPages = Math.max(1, Math.ceil(filteredRiwayat.length / ITEMS_PER_PAGE));
    const paginatedRiwayat = filteredRiwayat.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const hasServerFilterActive = appliedFilters.bulan || appliedFilters.status || appliedFilters.subject_id;
    const hasClientFilterActive = clientFilters.search || clientFilters.dateFrom || clientFilters.dateTo;

    const subjectLabel = (id) => subjects.find((s) => String(s.id) === String(id))?.name;

    const today = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <div className="space-y-5">
            {/* PAGE HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-[#1E3A5F] tracking-tight">Riwayat Absensi</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">
                        Lihat dan pantau seluruh riwayat kehadiran kamu secara terperinci.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        disabled
                        title="Fitur belum tersedia"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E7EB] text-[#9CA3AF] text-xs font-semibold rounded-lg cursor-not-allowed"
                    >
                        <Download size={16} />
                        <span>Unduh Rekap (PDF/Excel)</span>
                    </button>
                    <button
                        onClick={handleSegarkan}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        <span>Segarkan</span>
                    </button>
                </div>
            </div>

            {/* SUMMARY CARDS (data asli) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
                    <span className="text-[11px] uppercase tracking-wide text-[#6B7280]">Total Kehadiran</span>
                    <div className="mt-2">
                        <span className="text-2xl font-bold text-[#1F2937]">{summary.total}</span>
                        <span className="text-xs text-[#6B7280] ml-1">Sesi</span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">Total sesi tercatat</p>
                </div>

                <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-emerald-700">Hadir</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {summary.pctHadir}%
                        </span>
                    </div>
                    <div className="mt-2">
                        <span className="text-2xl font-bold text-emerald-800">{summary.hadir}</span>
                        <span className="text-xs text-emerald-700 ml-1">Sesi</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Dari total sesi tercatat</p>
                </div>

                <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-amber-700">Izin</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {summary.pctIzin}%
                        </span>
                    </div>
                    <div className="mt-2">
                        <span className="text-2xl font-bold text-amber-800">{summary.izin}</span>
                        <span className="text-xs text-amber-700 ml-1">Sesi</span>
                    </div>
                    <p className="text-[11px] text-amber-700 mt-0.5">Status izin tercatat</p>
                </div>

                <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-blue-700">Sakit</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {summary.pctSakit}%
                        </span>
                    </div>
                    <div className="mt-2">
                        <span className="text-2xl font-bold text-blue-800">{summary.sakit}</span>
                        <span className="text-xs text-blue-700 ml-1">Sesi</span>
                    </div>
                    <p className="text-[11px] text-blue-700 mt-0.5">Status sakit tercatat</p>
                </div>

                <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-red-700">Alpa</span>
                        {summary.alpa > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                                Peringatan
                            </span>
                        )}
                    </div>
                    <div className="mt-2">
                        <span className="text-2xl font-bold text-red-700">{summary.alpa}</span>
                        <span className="text-xs text-red-600 ml-1">Sesi</span>
                    </div>
                    <p className="text-[11px] text-red-600 mt-0.5">
                        {summary.lastAlpa
                            ? `${formatTanggalHari(summary.lastAlpa.tanggal).tanggal} • ${summary.lastAlpa.mata_pelajaran}`
                            : 'Tidak ada catatan alpa'}
                    </p>
                </div>
            </div>

            {/* FILTER & SEARCH TOOLBAR */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                            type="text"
                            value={clientFilters.search}
                            onChange={(e) => {
                                setPage(1);
                                setClientFilters((f) => ({ ...f, search: e.target.value }));
                            }}
                            placeholder="Cari mata pelajaran..."
                            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1E3A5F]"
                        />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <input
                            type="date"
                            value={clientFilters.dateFrom}
                            onChange={(e) => {
                                setPage(1);
                                setClientFilters((f) => ({ ...f, dateFrom: e.target.value }));
                            }}
                            className="h-9 px-2 text-[11px] bg-white border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:border-[#1E3A5F]"
                        />
                        <input
                            type="date"
                            value={clientFilters.dateTo}
                            onChange={(e) => {
                                setPage(1);
                                setClientFilters((f) => ({ ...f, dateTo: e.target.value }));
                            }}
                            className="h-9 px-2 text-[11px] bg-white border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:border-[#1E3A5F]"
                        />
                        <input
                            type="month"
                            value={draftFilters.bulan}
                            onChange={(e) => setDraftFilters((f) => ({ ...f, bulan: e.target.value }))}
                            className="h-9 px-2 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:border-[#1E3A5F]"
                        />
                        <select
                            value={draftFilters.subject_id}
                            onChange={(e) => setDraftFilters((f) => ({ ...f, subject_id: e.target.value }))}
                            className="h-9 px-2 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:border-[#1E3A5F]"
                        >
                            <option value="">Semua Mapel</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <select
                            value={draftFilters.status}
                            onChange={(e) => setDraftFilters((f) => ({ ...f, status: e.target.value }))}
                            className="h-9 px-2 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:border-[#1E3A5F]"
                        >
                            <option value="">Semua Status</option>
                            <option value="hadir">Hadir</option>
                            <option value="izin">Izin</option>
                            <option value="sakit">Sakit</option>
                            <option value="alpa">Alpa</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleTerapkanFilter}
                            className="h-9 px-4 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                        >
                            <Filter size={15} />
                            <span>Terapkan Filter</span>
                        </button>
                        <button
                            onClick={handleResetSemua}
                            className="h-9 px-3 bg-white hover:bg-[#F5F7FA] border border-[#E5E7EB] text-[#4B5563] text-xs font-semibold rounded-lg whitespace-nowrap"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {(hasServerFilterActive || hasClientFilterActive) && (
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#F3F4F6] text-xs text-[#6B7280]">
                        <span className="text-[11px] font-medium text-[#9CA3AF]">Filter aktif:</span>
                        {appliedFilters.bulan && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-md border border-blue-200">
                                {formatBulanLabel(appliedFilters.bulan)}
                            </span>
                        )}
                        {appliedFilters.status && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-md border border-blue-200">
                                {STATUS_LABEL[appliedFilters.status]}
                            </span>
                        )}
                        {appliedFilters.subject_id && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-md border border-blue-200">
                                {subjectLabel(appliedFilters.subject_id)}
                            </span>
                        )}
                        {clientFilters.search && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F3F4F6] text-[#374151] text-[11px] font-medium rounded-md border border-[#E5E7EB]">
                                Cari: {clientFilters.search}
                            </span>
                        )}
                        {(clientFilters.dateFrom || clientFilters.dateTo) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F3F4F6] text-[#374151] text-[11px] font-medium rounded-md border border-[#E5E7EB]">
                                Rentang: {clientFilters.dateFrom || '…'} - {clientFilters.dateTo || '…'}
                            </span>
                        )}
                        <button onClick={handleResetSemua} className="text-[11px] text-blue-700 hover:underline ml-1">
                            Hapus semua filter
                        </button>
                    </div>
                )}
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-[#6B7280] text-sm">Memuat data...</div>
                ) : errorMsg ? (
                    <div className="p-10 text-center text-red-600 text-sm">{errorMsg}</div>
                ) : riwayat.length === 0 ? (
                    <div className="p-10 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#F5F7FA] text-[#1E3A5F] flex items-center justify-center mb-3">
                            <HistoryIcon size={22} />
                        </div>
                        <h3 className="text-sm font-semibold text-[#1F2937]">Belum Ada Riwayat Absensi</h3>
                        <p className="text-xs text-[#6B7280] max-w-xs mt-1">
                            Riwayat absensi kamu akan otomatis tercatat setelah kamu melakukan presensi pada sesi belajar aktif.
                        </p>
                        <button
                            onClick={() => navigate('/student/scan')}
                            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F7FA] text-[#1E3A5F] border border-[#E5E7EB] text-xs font-medium rounded-lg"
                        >
                            <QrCode size={15} />
                            <span>Lakukan Scan QR</span>
                        </button>
                    </div>
                ) : filteredRiwayat.length === 0 ? (
                    <div className="p-10 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3">
                            <SearchX size={22} />
                        </div>
                        <h3 className="text-sm font-semibold text-[#1F2937]">Data Tidak Ditemukan</h3>
                        <p className="text-xs text-[#6B7280] max-w-xs mt-1">
                            Tidak ada riwayat absensi yang cocok dengan filter atau kata kunci pencarian yang dipilih.
                        </p>
                        <button
                            onClick={handleResetSemua}
                            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1F2937] text-xs font-semibold rounded-lg"
                        >
                            <RotateCcw size={15} />
                            <span>Reset Filter</span>
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#F5F7FA] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                                        <th className="py-2.5 px-3 w-10 text-center">No</th>
                                        <th className="py-2.5 px-3">Tanggal &amp; Hari</th>
                                        <th className="py-2.5 px-4">Mata Pelajaran</th>
                                        <th className="py-2.5 px-4">Guru Pengampu</th>
                                        <th className="py-2.5 px-3">Kelas</th>
                                        <th className="py-2.5 px-3">Jam Pelajaran</th>
                                        <th className="py-2.5 px-3">Status</th>
                                        <th className="py-2.5 px-3">Waktu Presensi</th>
                                        <th className="py-2.5 px-3 text-center w-16">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB] text-xs text-[#1F2937]">
                                    {paginatedRiwayat.map((row, idx) => {
                                        const { tanggal, hari } = formatTanggalHari(row.tanggal);
                                        return (
                                            <tr key={row.id ?? `${row.tanggal}-${idx}`} className="hover:bg-[#F8FAFC] transition-colors">
                                                <td className="py-2 px-3 text-center text-[#6B7280] font-medium">
                                                    {(page - 1) * ITEMS_PER_PAGE + idx + 1}
                                                </td>
                                                <td className="py-2 px-3">
                                                    <div className="font-semibold text-[#1F2937]">{tanggal}</div>
                                                    <div className="text-[11px] text-[#6B7280]">{hari}</div>
                                                </td>
                                                <td className="py-2 px-4 font-semibold text-[#1E3A5F]">
                                                    {row.mata_pelajaran}
                                                </td>
                                                <td className="py-2 px-4 text-[#6B7280]">-</td>
                                                <td className="py-2 px-3">
                                                    <span className="inline-block px-2 py-0.5 bg-[#F3F4F6] text-[#374151] rounded text-[11px] font-medium border border-[#E5E7EB]">
                                                        {row.kelas}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3 text-[#6B7280]">-</td>
                                                <td className="py-2 px-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                                            STATUS_BADGE[row.status] || 'bg-[#F5F7FA] text-[#6B7280]'
                                                        }`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[row.status] || 'bg-[#9CA3AF]'}`} />
                                                        {STATUS_LABEL[row.status] || row.status}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3 font-medium text-[#1F2937]">
                                                    {row.waktu || '-'}
                                                </td>
                                                <td className="py-2 px-3 text-center">
                                                    <button
                                                        onClick={() => setSelectedDetail(row)}
                                                        title="Lihat Rincian Presensi"
                                                        className="p-1 text-[#6B7280] hover:text-[#1E3A5F] hover:bg-blue-50 rounded transition-colors"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-[#E5E7EB] gap-3">
                                <div className="text-xs text-[#6B7280]">
                                    Menampilkan{' '}
                                    <span className="font-semibold text-[#1F2937]">
                                        {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredRiwayat.length)}
                                    </span>{' '}
                                    dari <span className="font-semibold text-[#1F2937]">{filteredRiwayat.length}</span> data absensi
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        className="h-8 px-2.5 text-xs font-medium text-[#4B5563] bg-white border border-[#E5E7EB] rounded hover:bg-[#F5F7FA] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        <ChevronLeft size={15} />
                                        Prev
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`h-8 w-8 text-xs font-semibold rounded ${
                                                p === page
                                                    ? 'bg-[#1E3A5F] text-white'
                                                    : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F5F7FA]'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        className="h-8 px-2.5 text-xs font-medium text-[#4B5563] bg-white border border-[#E5E7EB] rounded hover:bg-[#F5F7FA] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        Next
                                        <ChevronRight size={15} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* DETAIL MODAL — hanya field yang tersedia dari API */}
            {selectedDetail && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
                    onClick={() => setSelectedDetail(null)}
                >
                    <div
                        className="bg-white w-full max-w-sm rounded-lg border border-[#E5E7EB] shadow-xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F5F7FA]">
                            <div className="flex items-center gap-2">
                                <ReceiptText size={18} className="text-[#1E3A5F]" />
                                <span className="text-xs font-bold text-[#1F2937]">Detail Riwayat Absensi</span>
                            </div>
                            <button onClick={() => setSelectedDetail(null)} className="text-[#6B7280] hover:text-[#1F2937]">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-4 space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#F3F4F6]">
                                <div>
                                    <span className="text-[10px] text-[#6B7280] block">Tanggal</span>
                                    <span className="font-semibold text-[#1F2937]">
                                        {formatTanggalHari(selectedDetail.tanggal).tanggal}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-[#6B7280] block">Kelas</span>
                                    <span className="font-semibold text-[#1F2937]">{selectedDetail.kelas}</span>
                                </div>
                            </div>
                            <div className="pb-3 border-b border-[#F3F4F6]">
                                <span className="text-[10px] text-[#6B7280] block">Mata Pelajaran</span>
                                <div className="font-semibold text-[#1E3A5F]">{selectedDetail.mata_pelajaran}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#F3F4F6]">
                                <div>
                                    <span className="text-[10px] text-[#6B7280] block">Guru Pengampu</span>
                                    <span className="font-semibold text-[#1F2937]">-</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-[#6B7280] block">Jam Pelajaran</span>
                                    <span className="font-semibold text-[#1F2937]">-</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-[10px] text-[#6B7280] block">Status</span>
                                    <span
                                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                            STATUS_BADGE[selectedDetail.status] || ''
                                        }`}
                                    >
                                        {STATUS_LABEL[selectedDetail.status] || selectedDetail.status}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-[#6B7280] block">Waktu Presensi</span>
                                    <span className="font-bold text-[#1F2937]">{selectedDetail.waktu || '-'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-2.5 border-t border-[#E5E7EB] flex justify-end">
                            <button
                                onClick={() => setSelectedDetail(null)}
                                className="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded hover:bg-[#16304F] transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}