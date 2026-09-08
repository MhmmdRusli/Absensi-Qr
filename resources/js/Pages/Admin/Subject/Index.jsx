import { useEffect, useMemo, useState } from 'react';
import api from '../../../Lib/axios';
import Modal from '../../../Components/Modal';
import {
    Search, RotateCcw, Download, Eye, Pencil, Trash2, Plus,
    BookOpen, CheckCircle2, Archive, ChevronLeft, ChevronRight,
    TriangleAlert, ChevronDown, X,
} from 'lucide-react';

const emptyForm = { name: '' };
const PAGE_SIZE = 10;

const NAVY = '#1E3A5F';
const NAVY_HOVER = '#16304F';

export default function SubjectIndex() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState('');

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [detailTarget, setDetailTarget] = useState(null);

    const fetchSubjects = async () => {
        const response = await api.get('/admin/subjects');
        setSubjects(response.data.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const openCreateModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (subject) => {
        setEditingId(subject.id);
        setForm({ name: subject.name });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors({});

        try {
            if (editingId) {
                const response = await api.put(`/admin/subjects/${editingId}`, form);
                setNotice(response.data.message);
            } else {
                const response = await api.post('/admin/subjects', form);
                setNotice(response.data.message);
            }

            setIsModalOpen(false);
            fetchSubjects();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? { name: [err.response.data.message] });
            }
        }
    };

    const openDeleteModal = (subject) => {
        setDeleteError('');
        setDeleteTarget(subject);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleteError('');
        try {
            await api.delete(`/admin/subjects/${deleteTarget.id}`);
            setNotice('Mata pelajaran berhasil dihapus.');
            setDeleteTarget(null);
            fetchSubjects();
        } catch (err) {
            if (err.response?.status === 422) {
                setDeleteError(err.response.data.message);
            }
        }
    };

    const filteredSubjects = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return subjects;
        return subjects.filter((s) => s.name.toLowerCase().includes(q));
    }, [subjects, search]);

    const totalPages = Math.max(1, Math.ceil(filteredSubjects.length / PAGE_SIZE));
    const pagedSubjects = filteredSubjects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => setPage(1), [search]);

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#1F2937]">Mata Pelajaran</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">
                        Kelola data mata pelajaran yang digunakan dalam sistem.
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
                    <span>Tambah Mata Pelajaran</span>
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
                        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Total Mata Pelajaran</span>
                        <span className="text-2xl font-semibold text-[#1F2937] mt-1">{subjects.length}</span>
                        <span className="text-xs text-[#6B7280] mt-2">Terdaftar di kurikulum</span>
                    </div>
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: '#EFF4FF', color: NAVY }}>
                        <BookOpen size={22} />
                    </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Mata Pelajaran Aktif</span>
                        <span className="text-2xl font-semibold text-[#1F2937] mt-1">–</span>
                        <span className="text-xs text-[#6B7280] mt-2">Menunggu field status</span>
                    </div>
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <CheckCircle2 size={22} />
                    </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Mata Pelajaran Nonaktif</span>
                        <span className="text-2xl font-semibold text-[#1F2937] mt-1">–</span>
                        <span className="text-xs text-[#6B7280] mt-2">Menunggu field status</span>
                    </div>
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-[#F5F7FA] text-[#6B7280] border border-[#E5E7EB]">
                        <Archive size={22} />
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
                            placeholder="Cari nama mata pelajaran atau kode..."
                            className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1"
                        />
                    </div>

                    <div className="relative" title="Belum tersedia — field belum ada di database">
                        <select disabled className="h-9 w-32 pl-3 pr-8 text-sm bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg text-[#9CA3AF] appearance-none cursor-not-allowed">
                            <option>Semua Tingkat</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                    </div>
                    <div className="relative" title="Belum tersedia — field belum ada di database">
                        <select disabled className="h-9 w-32 pl-3 pr-8 text-sm bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg text-[#9CA3AF] appearance-none cursor-not-allowed">
                            <option>Semua Status</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSearch('')}
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
                ) : filteredSubjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                        <div className="w-14 h-14 rounded-full bg-[#F5F7FA] flex items-center justify-center text-[#9CA3AF] mb-3">
                            <BookOpen size={28} />
                        </div>
                        <h3 className="text-base font-semibold text-[#1F2937]">
                            {subjects.length === 0 ? 'Belum ada data mata pelajaran.' : 'Tidak ada mata pelajaran yang cocok.'}
                        </h3>
                        <p className="text-sm text-[#6B7280] max-w-sm mt-1 mb-4">
                            {subjects.length === 0
                                ? 'Mulai dengan menambahkan data kurikulum dan mata pelajaran pertama untuk mengaktifkan sesi presensi guru.'
                                : 'Coba ubah kata kunci pencarian.'}
                        </p>
                        {subjects.length === 0 && (
                            <button
                                onClick={openCreateModal}
                                className="px-3.5 py-1.5 rounded-lg text-white text-sm font-medium flex items-center gap-2"
                                style={{ background: NAVY }}
                            >
                                <Plus size={14} />
                                <span>Tambah Mata Pelajaran</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F5F7FA] border-b border-[#E5E7EB] text-[11px] uppercase tracking-wide text-[#6B7280]">
                                    <th className="py-3 px-4 font-semibold">Kode</th>
                                    <th className="py-3 px-4 font-semibold">Nama Mata Pelajaran</th>
                                    <th className="py-3 px-4 font-semibold">Tingkat</th>
                                    <th className="py-3 px-4 font-semibold">Guru Pengampu</th>
                                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                                    <th className="py-3 px-4 font-semibold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB] text-sm">
                                {pagedSubjects.map((subject) => (
                                    <tr key={subject.id} className="hover:bg-[#F5F7FA]/60 transition-colors">
                                        <td className="py-2.5 px-4 text-[#9CA3AF]" title="Data belum tersedia">–</td>
                                        <td className="py-2.5 px-4 font-medium text-[#1F2937]">{subject.name}</td>
                                        <td className="py-2.5 px-4 text-[#9CA3AF]" title="Data belum tersedia">–</td>
                                        <td className="py-2.5 px-4 text-[#9CA3AF]" title="Data belum tersedia">–</td>
                                        <td className="py-2.5 px-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Aktif
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => setDetailTarget(subject)}
                                                    title="Lihat Detail"
                                                    className="p-1.5 text-[#6B7280] hover:text-[#1E3A5F] hover:bg-[#F5F7FA] rounded transition-colors"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(subject)}
                                                    title="Edit"
                                                    className="p-1.5 text-[#6B7280] hover:text-[#1E3A5F] hover:bg-[#F5F7FA] rounded transition-colors"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(subject)}
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

                {filteredSubjects.length > 0 && (
                    <div className="px-4 py-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#6B7280]">
                        <span>
                            Menampilkan{' '}
                            <strong className="text-[#1F2937] font-semibold">
                                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredSubjects.length)}
                            </strong>{' '}
                            dari <strong className="text-[#1F2937] font-semibold">{filteredSubjects.length}</strong> mata pelajaran
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
                title={editingId ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Nama Mata Pelajaran</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Contoh: Fisika"
                            className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-1"
                        />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name[0]}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full text-white py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ background: NAVY }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = NAVY_HOVER)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = NAVY)}
                    >
                        Simpan
                    </button>
                </form>
            </Modal>

            {/* MODAL DETAIL (read-only, data asli saja) */}
            {detailTarget && (
                <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl max-w-md w-full p-5">
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
                            <h3 className="text-base font-semibold text-[#1F2937]">Detail Mata Pelajaran</h3>
                            <button onClick={() => setDetailTarget(null)} className="text-[#9CA3AF] hover:text-[#1F2937]">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-3.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg flex items-start justify-between">
                            <div>
                                <h4 className="text-base font-semibold text-[#1F2937]">{detailTarget.name}</h4>
                                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                                    Aktif
                                </span>
                            </div>
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#EFF4FF', color: NAVY }}>
                                <BookOpen size={20} />
                            </div>
                        </div>
                        <p className="text-xs text-[#9CA3AF] mt-3">
                            Detail tambahan (kode, tingkat, guru pengampu, beban jam, jumlah kelas) belum tersedia — menunggu relasi & data terkait.
                        </p>
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
                                <h3 className="text-base font-semibold text-[#1F2937]">Hapus Mata Pelajaran?</h3>
                                <p className="text-sm text-[#6B7280] mt-1.5">
                                    Apakah Anda yakin ingin menghapus{' '}
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
                                Hapus Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}