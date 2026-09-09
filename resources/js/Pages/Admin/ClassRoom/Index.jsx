import { useEffect, useMemo, useState } from 'react';
import api from '../../../Lib/axios';
import Modal from '../../../Components/Modal';
import {
    Search, RotateCcw, Download, Eye, Pencil, Trash2, Plus,
    DoorOpen, CheckCircle2, Users, ChevronLeft, ChevronRight,
    FolderOpen, TriangleAlert, ChevronDown, X,
} from 'lucide-react';

const emptyForm = { name: '', tingkat: '', jurusan: '', wali_kelas: '', status: 'aktif' };
const PAGE_SIZE = 10;

const NAVY = '#1E3A5F';
const NAVY_HOVER = '#16304F';

export default function ClassRoomIndex() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState('');

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [tingkatFilter, setTingkatFilter] = useState('');
    const [jurusanFilter, setJurusanFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [detailTarget, setDetailTarget] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchClasses = async () => {
        try {
            const response = await api.get('/admin/classes');
            setClasses(response.data.data);
        } catch (err) {
            setNotice('Gagal memuat data kelas. Silakan muat ulang halaman.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (notice) {
            const timer = setTimeout(() => setNotice(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [notice]);

    const openCreateModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setErrors({});
        setNotice('');
        setIsModalOpen(true);
    };

    const openEditModal = (classRoom) => {
        setEditingId(classRoom.id);
        setForm({
            name: classRoom.name,
            tingkat: classRoom.tingkat || '',
            jurusan: classRoom.jurusan || '',
            wali_kelas: classRoom.wali_kelas || '',
            status: classRoom.status || 'aktif',
        });
        setErrors({});
        setNotice('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors({});
        setNotice('');
        setSubmitting(true);

        try {
            let response;
            if (editingId) {
                response = await api.put(`/admin/classes/${editingId}`, form);
            } else {
                response = await api.post('/admin/classes', form);
            }
            console.log('API response:', response.data);
            setNotice(response.data.message);

            setIsModalOpen(false);
            await fetchClasses();
        } catch (err) {
            console.error('Submit error:', err.response?.data || err.message);
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? { name: [err.response.data.message] });
            } else if (err.response?.status === 401 || err.response?.status === 403) {
                setNotice('Sesi Anda telah berakhir. Silakan login kembali.');
            } else {
                const message = err.response?.data?.message || err.message || 'Terjadi kesalahan. Silakan coba lagi.';
                setNotice(message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const openDeleteModal = (classRoom) => {
        setDeleteError('');
        setDeleteTarget(classRoom);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleteError('');
        try {
            await api.delete(`/admin/classes/${deleteTarget.id}`);
            setNotice('Kelas berhasil dihapus.');
            setDeleteTarget(null);
            fetchClasses();
        } catch (err) {
            if (err.response?.status === 422) {
                setDeleteError(err.response.data.message);
            }
        }
    };

    const filteredClasses = useMemo(() => {
        const q = search.trim().toLowerCase();
        return classes.filter((c) => {
            const matchesSearch = !q || c.name.toLowerCase().includes(q);
            const matchesTingkat = !tingkatFilter || c.tingkat === tingkatFilter;
            const matchesJurusan = !jurusanFilter || c.jurusan === jurusanFilter;
            const matchesStatus = !statusFilter || c.status === statusFilter;
            return matchesSearch && matchesTingkat && matchesJurusan && matchesStatus;
        });
    }, [classes, search, tingkatFilter, jurusanFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredClasses.length / PAGE_SIZE));
    const pagedClasses = filteredClasses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => setPage(1), [search, tingkatFilter, jurusanFilter, statusFilter]);

    const totalSiswaKeseluruhan = useMemo(
        () => classes.reduce((sum, c) => sum + (c.total_siswa || 0), 0),
        [classes]
    );

    const totalKelasAktif = useMemo(
        () => classes.filter((c) => (c.status || 'aktif') === 'aktif').length,
        [classes]
    );

    const tingkatOptions = useMemo(() => {
        const values = classes.map((c) => c.tingkat).filter(Boolean);
        return [...new Set(values)].sort();
    }, [classes]);

    const jurusanOptions = useMemo(() => {
        const values = classes.map((c) => c.jurusan).filter(Boolean);
        return [...new Set(values)].sort();
    }, [classes]);

    const statusOptions = useMemo(() => {
        const values = classes.map((c) => c.status).filter(Boolean);
        return [...new Set(values)].sort();
    }, [classes]);

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#1F2937]">Data Kelas</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">
                        Kelola data kelas yang digunakan dalam sistem.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                    style={{ background: NAVY }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = NAVY_HOVER)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = NAVY)}
                >
                    <Plus size={16} />
                    <span>Tambah Kelas</span>
                </button>
            </div>

            {notice && (
                <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-2 rounded-lg border border-emerald-200">
                    {notice}
                </div>
            )}

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Total Kelas</span>
                        <span className="text-2xl font-semibold text-[#1F2937] mt-1">{classes.length}</span>
                        <span className="text-xs text-[#6B7280] mt-2">Terdaftar di sistem</span>
                    </div>
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: '#EFF4FF', color: NAVY }}>
                        <DoorOpen size={22} />
                    </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Kelas Aktif</span>
                        <span className="text-2xl font-semibold text-[#1F2937] mt-1">{totalKelasAktif}</span>
                        <span className="text-xs text-[#6B7280] mt-2">Dari {classes.length} kelas</span>
                    </div>
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <CheckCircle2 size={22} />
                    </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Total Siswa</span>
                        <span className="text-2xl font-semibold text-[#1F2937] mt-1">{totalSiswaKeseluruhan}</span>
                        <span className="text-xs text-[#6B7280] mt-2">Tergabung dalam rombel</span>
                    </div>
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-[#F5F7FA] text-[#6B7280] border border-[#E5E7EB]">
                        <Users size={22} />
                    </div>
                </div>
            </div>

            {/* TOOLBAR */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div className="flex flex-1 items-center gap-3 min-w-[240px]">
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama kelas..."
                            className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={tingkatFilter}
                            onChange={(e) => setTingkatFilter(e.target.value)}
                            className="h-9 w-32 pl-3 pr-8 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#1F2937] appearance-none focus:outline-none focus:ring-1"
                        >
                            <option value="">Semua Tingkat</option>
                            {tingkatOptions.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={jurusanFilter}
                            onChange={(e) => setJurusanFilter(e.target.value)}
                            className="h-9 w-32 pl-3 pr-8 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#1F2937] appearance-none focus:outline-none focus:ring-1"
                        >
                            <option value="">Semua Jurusan</option>
                            {jurusanOptions.map((j) => (
                                <option key={j} value={j}>{j}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-9 w-32 pl-3 pr-8 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#1F2937] appearance-none focus:outline-none focus:ring-1"
                        >
                            <option value="">Semua Status</option>
                            {statusOptions.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setSearch(''); setTingkatFilter(''); setJurusanFilter(''); setStatusFilter(''); }}
                        className="h-9 px-3 rounded-lg border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#6B7280] text-sm flex items-center gap-1.5 transition-colors"
                    >
                        <RotateCcw size={14} />
                        <span>Reset</span>
                    </button>
                    <button
                        disabled
                        title="Belum tersedia"
                        className="h-9 px-3 rounded-lg border border-[#E5E7EB] bg-[#F5F7FA] text-[#9CA3AF] text-sm flex items-center gap-1.5 cursor-not-allowed"
                    >
                        <Download size={14} />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-[#9CA3AF] text-sm">Memuat data...</div>
                ) : filteredClasses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                        <div className="w-14 h-14 rounded-full bg-[#F5F7FA] flex items-center justify-center text-[#9CA3AF] mb-3">
                            <FolderOpen size={28} />
                        </div>
                        <h3 className="text-base font-semibold text-[#1F2937]">
                            {classes.length === 0 ? 'Belum ada data kelas.' : 'Tidak ada kelas yang cocok.'}
                        </h3>
                        <p className="text-sm text-[#6B7280] max-w-sm mt-1 mb-4">
                            {classes.length === 0
                                ? 'Mulai tambahkan kelas untuk mengelompokkan data siswa dan jadwal absensi harian.'
                                : 'Coba ubah kata kunci pencarian.'}
                        </p>
                        {classes.length === 0 && (
                            <button
                                onClick={openCreateModal}
                                className="px-3.5 py-1.5 rounded-lg text-white text-sm font-medium flex items-center gap-2"
                                style={{ background: NAVY }}
                            >
                                <Plus size={14} />
                                <span>Tambah Kelas</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F5F7FA] border-b border-[#E5E7EB] text-[11px] uppercase tracking-wide text-[#6B7280]">
                                    <th className="py-3 px-4 font-semibold">Nama Kelas</th>
                                    <th className="py-3 px-4 font-semibold">Tingkat</th>
                                    <th className="py-3 px-4 font-semibold">Jurusan</th>
                                    <th className="py-3 px-4 font-semibold">Wali Kelas</th>
                                    <th className="py-3 px-4 font-semibold">Jumlah Siswa</th>
                                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                                    <th className="py-3 px-4 font-semibold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB] text-sm">
                                {pagedClasses.map((classRoom) => (
                                    <tr key={classRoom.id} className="hover:bg-[#F5F7FA]/60 transition-colors">
                                        <td className="py-2.5 px-4 font-semibold" style={{ color: NAVY }}>{classRoom.name}</td>
                                        <td className="py-2.5 px-4 text-[#1F2937]">{classRoom.tingkat || '-'}</td>
                                        <td className="py-2.5 px-4 text-[#1F2937]">{classRoom.jurusan || '-'}</td>
                                        <td className="py-2.5 px-4 text-[#1F2937]">{classRoom.wali_kelas || '-'}</td>
                                        <td className="py-2.5 px-4 text-[#1F2937] font-medium">{classRoom.total_siswa} Siswa</td>
                                        <td className="py-2.5 px-4 text-center">
                                            {classRoom.status === 'aktif' || !classRoom.status ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                                    {classRoom.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => setDetailTarget(classRoom)}
                                                    title="Lihat Detail"
                                                    className="p-1.5 text-[#6B7280] hover:text-[#1E3A5F] hover:bg-[#F5F7FA] rounded transition-colors"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(classRoom)}
                                                    title="Edit"
                                                    className="p-1.5 text-[#6B7280] hover:text-[#1E3A5F] hover:bg-[#F5F7FA] rounded transition-colors"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(classRoom)}
                                                    title="Hapus"
                                                    className="p-1.5 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {filteredClasses.length > 0 && (
                    <div className="px-4 py-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#6B7280]">
                        <span>
                            Menampilkan{' '}
                            <strong className="text-[#1F2937] font-semibold">
                                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredClasses.length)}
                            </strong>{' '}
                            dari <strong className="text-[#1F2937] font-semibold">{filteredClasses.length}</strong> kelas
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="h-8 px-2.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F5F7FA] disabled:opacity-40 flex items-center gap-1 transition-colors"
                            >
                                <ChevronLeft size={14} /> <span>Prev</span>
                            </button>
                            <span
                                className="w-8 h-8 rounded-lg text-white font-semibold text-xs flex items-center justify-center"
                                style={{ background: NAVY }}
                            >
                                {page}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="h-8 px-2.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F5F7FA] disabled:opacity-40 flex items-center gap-1 transition-colors"
                            >
                                <span>Next</span> <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL TAMBAH/EDIT */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? 'Edit Kelas' : 'Tambah Kelas'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Nama Kelas</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Contoh: XI PPLG 1"
                            className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-1"
                        />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name[0]}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Tingkat</label>
                            <input
                                type="text"
                                value={form.tingkat}
                                onChange={(e) => setForm({ ...form, tingkat: e.target.value })}
                                placeholder="Contoh: X, XI, XII"
                                className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-1"
                            />
                            {errors.tingkat && <p className="text-xs text-red-600 mt-1">{errors.tingkat[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Jurusan</label>
                            <input
                                type="text"
                                value={form.jurusan}
                                onChange={(e) => setForm({ ...form, jurusan: e.target.value })}
                                placeholder="Contoh: PPLG"
                                className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-1"
                            />
                            {errors.jurusan && <p className="text-xs text-red-600 mt-1">{errors.jurusan[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Wali Kelas</label>
                            <input
                                type="text"
                                value={form.wali_kelas}
                                onChange={(e) => setForm({ ...form, wali_kelas: e.target.value })}
                                placeholder="Contoh: Pak Ahmad"
                                className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-1"
                            />
                            {errors.wali_kelas && <p className="text-xs text-red-600 mt-1">{errors.wali_kelas[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-1"
                            >
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                            {errors.status && <p className="text-xs text-red-600 mt-1">{errors.status[0]}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ background: NAVY }}
                        onMouseEnter={(e) => !submitting && (e.currentTarget.style.background = NAVY_HOVER)}
                        onMouseLeave={(e) => !submitting && (e.currentTarget.style.background = NAVY)}
                    >
                        {submitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </form>
            </Modal>

            {/* MODAL DETAIL (read-only, data asli saja) */}
            {detailTarget && (
                <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl max-w-md w-full p-5">
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
                            <h3 className="text-base font-semibold text-[#1F2937]">Detail Kelas</h3>
                            <button onClick={() => setDetailTarget(null)} className="text-[#9CA3AF] hover:text-[#1F2937]">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-3 bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold" style={{ color: NAVY }}>{detailTarget.name}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                                        {detailTarget.status || 'Aktif'}
                                    </span>
                                </div>
                                <div className="mt-1 text-xs text-[#6B7280] space-y-0.5">
                                    {detailTarget.tingkat && <p>Tingkat: <strong className="text-[#1F2937]">{detailTarget.tingkat}</strong></p>}
                                    {detailTarget.jurusan && <p>Jurusan: <strong className="text-[#1F2937]">{detailTarget.jurusan}</strong></p>}
                                    {detailTarget.wali_kelas && <p>Wali Kelas: <strong className="text-[#1F2937]">{detailTarget.wali_kelas}</strong></p>}
                                    {detailTarget.status && <p>Status: <strong className="text-[#1F2937]">{detailTarget.status}</strong></p>}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-bold" style={{ color: NAVY }}>{detailTarget.total_siswa}</span>
                                <span className="block text-[10px] text-[#6B7280] uppercase">Siswa Terdaftar</span>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => setDetailTarget(null)}
                                className="h-9 px-4 rounded-lg border border-[#E5E7EB] text-[#1F2937] hover:bg-[#F5F7FA] text-sm font-medium transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI HAPUS */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl max-w-sm w-full p-5">
                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                                <TriangleAlert size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-[#1F2937]">Hapus Data Kelas?</h3>
                                <p className="text-sm text-[#6B7280] mt-1.5">
                                    Apakah Anda yakin ingin menghapus kelas{' '}
                                    <strong className="text-[#1F2937]">{deleteTarget.name}</strong>? Tindakan ini
                                    tidak dapat dibatalkan.
                                </p>
                                {deleteError && (
                                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2.5">
                                        {deleteError}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2.5 mt-5">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-3.5 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1F2937] text-sm font-medium transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                            >
                                Hapus Kelas
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}