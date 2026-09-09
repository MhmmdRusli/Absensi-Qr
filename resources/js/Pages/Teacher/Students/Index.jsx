import { useEffect, useMemo, useState } from 'react';
import { Search, RotateCcw, ChevronLeft, ChevronRight, Eye, Users, TrendingUp, AlertTriangle, CalendarCheck } from 'lucide-react';
import api from '../../../Lib/axios';

const PAGE_SIZE = 10;

export default function TeacherStudentsIndex() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [page, setPage] = useState(1);
    const [detailStudent, setDetailStudent] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const response = await api.get('/teacher/students');
                setStudents(response.data.data);
            } catch (err) {
                console.error('Gagal memuat data siswa:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const kelasOptions = useMemo(() => [...new Set(students.map((s) => s.kelas))].sort(), [students]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return students.filter((s) => {
            const matchSearch = !q || s.nama.toLowerCase().includes(q) || s.kelas.toLowerCase().includes(q);
            const matchClass = !classFilter || s.kelas === classFilter;
            return matchSearch && matchClass;
        });
    }, [students, search, classFilter]);

    const sorted = useMemo(() => {
        const copy = [...filtered];
        copy.sort((a, b) => a.nama.localeCompare(b.nama));
        return copy;
    }, [filtered]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => setPage(1), [search, classFilter]);

    const summary = useMemo(() => {
        const withData = students.filter((s) => s.total_sesi > 0);
        const totalSiswa = students.length;
        const rataKehadiran = withData.length ? withData.reduce((sum, s) => sum + s.pct, 0) / withData.length : 0;
        const perluPerhatian = students.filter((s) => s.total_sesi > 0 && s.pct < 80).length;
        const totalSesi = students.reduce((sum, s) => sum + s.total_sesi, 0);
        return { totalSiswa, rataKehadiran, perluPerhatian, totalSesi };
    }, [students]);

    const statusBadge = (pct) => {
        if (pct >= 95) return { label: 'Sangat Baik', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
        if (pct >= 80) return { label: 'Baik', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
        if (pct >= 70) return { label: 'Perhatian', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
        return { label: 'Kritis', cls: 'bg-rose-50 text-rose-700 border-rose-200' };
    };

    const initials = (name) => name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

    const resetFilters = () => {
        setSearch('');
        setClassFilter('');
    };

    return (
        <div className="space-y-5">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-[#1E3A5F] tracking-tight">Data Siswa</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">
                        Direktori siswa yang diampu dan rekapitulasi kehadiran per sesi absensi.
                    </p>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-[#6B7280]">Total Siswa Diampu</span>
                        <div className="w-8 h-8 rounded bg-[#F5F7FA] text-[#1E3A5F] flex items-center justify-center">
                            <Users size={16} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[#1F2937] mt-2">{summary.totalSiswa} <span className="text-sm font-normal text-[#6B7280]">Siswa</span></p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-[#6B7280]">Rata-rata Kehadiran</span>
                        <div className="w-8 h-8 rounded bg-[#F5F7FA] text-[#1E3A5F] flex items-center justify-center">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[#1E3A5F] mt-2">{summary.rataKehadiran.toFixed(1)}%</p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-[#6B7280]">Perlu Perhatian Khusus</span>
                        <div className="w-8 h-8 rounded bg-[#F5F7FA] text-[#1E3A5F] flex items-center justify-center">
                            <AlertTriangle size={16} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[#1F2937] mt-2">{summary.perluPerhatian} <span className="text-sm font-normal text-[#6B7280]">Siswa</span></p>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-[#6B7280]">Total Sesi Diselenggarakan</span>
                        <div className="w-8 h-8 rounded bg-[#F5F7FA] text-[#1E3A5F] flex items-center justify-center">
                            <CalendarCheck size={16} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[#1F2937] mt-2">{summary.totalSesi} <span className="text-sm font-normal text-[#6B7280]">Sesi</span></p>
                </div>
            </div>

            {/* FILTER TOOLBAR */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama siswa atau kelas..."
                            className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-[#E5E7EB] rounded text-[#1F2937] focus:outline-none focus:border-[#1E3A5F]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="h-9 px-2.5 pr-8 text-xs bg-white border border-[#E5E7EB] rounded focus:outline-none focus:border-[#1E3A5F]"
                        >
                            <option value="">Semua Kelas</option>
                            {kelasOptions.map((k) => <option key={k} value={k}>{k}</option>)}
                        </select>
                        <button
                            onClick={resetFilters}
                            className="h-9 px-3 flex items-center justify-center gap-1 border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#6B7280] rounded text-[11px] font-medium"
                        >
                            <RotateCcw size={13} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-[#6B7280] text-sm">Memuat data...</div>
                ) : sorted.length === 0 ? (
                    <div className="p-10 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#F5F7FA] text-[#9CA3AF] flex items-center justify-center mb-3">
                            <Users size={22} />
                        </div>
                        <h3 className="text-sm font-semibold text-[#1F2937]">Tidak Ada Siswa</h3>
                        <p className="text-xs text-[#6B7280] max-w-xs mt-1">
                            Belum ada data siswa dari sesi yang Anda buat, atau tidak ada yang sesuai filter.
                        </p>
                        {students.length > 0 && (
                            <button onClick={resetFilters} className="mt-4 px-4 py-1.5 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-xs font-semibold rounded-lg">
                                Reset Filter
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
                                        <th className="py-2.5 px-4">Siswa</th>
                                        <th className="py-2.5 px-3">Kelas</th>
                                        <th className="py-2.5 px-3 text-center">Kehadiran</th>
                                        <th className="py-2.5 px-4 min-w-[140px]">% Kehadiran</th>
                                        <th className="py-2.5 px-3 text-center">Status</th>
                                        <th className="py-2.5 px-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E7EB] text-xs text-[#1F2937]">
                                    {paginated.map((s, i) => {
                                        const badge = statusBadge(s.pct);
                                        return (
                                            <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                                                <td className="py-2.5 px-3 text-center text-[#9CA3AF]">{(page - 1) * PAGE_SIZE + i + 1}</td>
                                                <td className="py-2.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                            {initials(s.nama)}
                                                        </div>
                                                        <span className="font-medium text-[#1F2937]">{s.nama}</span>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3 font-medium">{s.kelas}</td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className="font-semibold text-[#1F2937]">{s.total_hadir}</span>
                                                    <span className="text-[#9CA3AF]"> / {s.total_sesi}</span>
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-[11px] font-semibold">
                                                            <span>{s.pct.toFixed(1)}%</span>
                                                            <span className="text-[#9CA3AF]">{s.total_hadir}/{s.total_sesi} Sesi</span>
                                                        </div>
                                                        <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className="h-1.5 rounded-full bg-[#1E3A5F]"
                                                                style={{ width: `${Math.min(s.pct, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.cls}`}>
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                    <button
                                                        onClick={() => setDetailStudent(s)}
                                                        className="px-2.5 py-1 bg-[#F5F7FA] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white rounded text-[11px] font-medium transition-colors"
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        <div className="p-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
                            <span>
                                Menampilkan <span className="font-semibold text-[#1F2937]">{(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, sorted.length)}</span> dari <span className="font-semibold text-[#1F2937]">{sorted.length}</span> siswa
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
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
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-2.5 py-1 text-xs border border-[#E5E7EB] rounded hover:bg-[#F5F7FA] disabled:opacity-40 flex items-center gap-1"
                                >
                                    Berikutnya <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* MODAL DETAIL SISWA */}
            {detailStudent && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setDetailStudent(null)}>
                    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-2xl max-w-md w-full p-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
                            <h3 className="text-sm font-bold text-[#1F2937]">Rincian {detailStudent.nama}</h3>
                            <button onClick={() => setDetailStudent(null)} className="text-[#9CA3AF] hover:text-[#1F2937]"><Eye size={18} /></button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                                <span className="text-[#6B7280]">Nama Siswa</span>
                                <span className="font-medium text-[#1F2937]">{detailStudent.nama}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                                <span className="text-[#6B7280]">Kelas</span>
                                <span className="font-medium text-[#1F2937]">{detailStudent.kelas}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                                <span className="text-[#6B7280]">Total Sesi</span>
                                <span className="font-medium text-[#1F2937]">{detailStudent.total_sesi} Sesi</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                                <span className="text-[#6B7280]">Total Hadir</span>
                                <span className="font-medium text-[#1F2937]">{detailStudent.total_hadir} Kali</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-[#6B7280]">Persentase Kehadiran</span>
                                <span className="font-bold text-[#1E3A5F]">{detailStudent.pct.toFixed(1)}%</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex justify-end">
                            <button
                                onClick={() => setDetailStudent(null)}
                                className="px-4 py-1.5 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-xs font-semibold rounded-lg"
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
