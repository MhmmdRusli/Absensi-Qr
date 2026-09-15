import { useEffect, useMemo, useState } from 'react';
import api from '../../../Lib/axios';
import Modal from '../../../Components/Modal';
import BulkImportModal from '../../../Components/BulkImportModal';
import {
    Search, RotateCcw, Download, Eye, Pencil, Trash2, Plus, Upload,
    GraduationCap, CheckCircle2, XCircle, ChevronLeft, ChevronRight,
    Inbox, TriangleAlert, ChevronDown,
} from 'lucide-react';

const emptyForm = { name: '', email: '', gender: '', nis: '', class_id: '', status: 'aktif' };
const PAGE_SIZE = 10;

const NAVY = '#1E3A5F';
const NAVY_HOVER = '#16304F';

export default function StudentIndex() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [search, setSearch] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isImportOpen, setIsImportOpen] = useState(false);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/admin/students');
            setStudents(response.data.data);
        } catch (err) {
            setNotice('Gagal memuat data siswa.');
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await api.get('/classes-list');
            setClasses(response.data.data);
        } catch (err) {
            setNotice('Gagal memuat data kelas.');
        }
    };

    useEffect(() => {
        fetchStudents();
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

    const openEditModal = (student) => {
        setEditingId(student.id);
        setForm({
            name: student.name,
            email: student.email,
            gender: student.gender || '',
            nis: student.nis,
            class_id: student.class_id,
            status: student.status || 'aktif',
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
                response = await api.put(`/admin/students/${editingId}`, form);
            } else {
                response = await api.post('/admin/students', form);
            }
            setNotice(response.data.message);
            setIsModalOpen(false);
            fetchStudents();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? {});
            } else {
                const message = err.response?.data?.message || err.message || 'Terjadi kesalahan.';
                setNotice(message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/admin/students/${deleteTarget.id}`);
            setNotice('Siswa berhasil dihapus.');
            fetchStudents();
        } catch (err) {
            setNotice(err.response?.data?.message || 'Gagal menghapus siswa.');
        }
        setDeleteTarget(null);
    };

    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            const q = search.trim().toLowerCase();
            const matchSearch =
                !q || s.name.toLowerCase().includes(q) || String(s.nis).toLowerCase().includes(q);
            const matchClass = !classFilter || String(s.class_id) === String(classFilter);
            const matchGender = !genderFilter || s.gender === genderFilter;
            const matchStatus = !statusFilter || s.status === statusFilter;
            return matchSearch && matchClass && matchGender && matchStatus;
        });
    }, [students, search, classFilter, genderFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
    const pagedStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => setPage(1), [search, classFilter, genderFilter, statusFilter]);

    const resetFilters = () => {
        setSearch('');
        setClassFilter('');
        setGenderFilter('');
        setStatusFilter('');
    };

    const genderOptions = useMemo(() => {
        const values = students.map((s) => s.gender).filter(Boolean);
        return [...new Set(values)].sort();
    }, [students]);

    const statusOptions = useMemo(() => {
        const values = students.map((s) => s.status).filter(Boolean);
        return [...new Set(values)].sort();
    }, [students]);

    const initials = (name) =>
        name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#1F2937]">Data Siswa</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">
                        Kelola data siswa yang terdaftar dalam sistem.
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
                    <span>Tambah Siswa</span>
                </button>
            </div>

            {notice && (
                <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-2 rounded-lg border border-emerald-200">
                    {notice}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Total Siswa</span>
                        <span className="text-2xl font-semibold text-[#1F2937] mt-1">{students.length}</span>
                        <span className="text-xs text-[#6B7280] mt-2">Terdaftar di sistem</span>
                    </div>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#EFF4FF', color: NAVY }}>
                        <GraduationCap size={22} />
                    </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Siswa Aktif</span>
                        <span className="text-2xl font-semibold text-[#1F2937] mt-1">
                            {students.filter((s) => (s.status || 'aktif') === 'aktif').length}
                        </span>
                        <span className="text-xs text-[#6B7280] mt-2">Siswa aktif</span>
                    </div>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <CheckCircle2 size={22} />
                    </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Siswa Nonaktif</span>
                        <span className="text-2xl font-semibold text-[#1F2937] mt-1">
                            {students.filter((s) => s.status === 'nonaktif').length}
                        </span>
                        <span className="text-xs text-[#6B7280] mt-2">Siswa nonaktif</span>
                    </div>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#F5F7FA] text-[#6B7280] border border-[#E5E7EB]">
                        <XCircle size={22} />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#E5E7EB] flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                    <div className="relative flex-1 min-w-[260px]">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama siswa atau NIS..."
                            className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1"
                            style={{ '--tw-ring-color': NAVY }}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <select
                                value={classFilter}
                                onChange={(e) => setClassFilter(e.target.value)}
                                className="h-9 pl-3 pr-8 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#1F2937] appearance-none cursor-pointer focus:outline-none"
                            >
                                <option value="">Semua Kelas</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                value={genderFilter}
                                onChange={(e) => setGenderFilter(e.target.value)}
                                className="h-9 pl-3 pr-8 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#1F2937] appearance-none cursor-pointer focus:outline-none"
                            >
                                <option value="">Semua Gender</option>
                                <option value="laki-laki">Laki-laki</option>
                                <option value="perempuan">Perempuan</option>
                                {genderOptions.filter((g) => g !== 'laki-laki' && g !== 'perempuan').map((g) => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-9 pl-3 pr-8 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#1F2937] appearance-none cursor-pointer focus:outline-none"
                            >
                                <option value="">Semua Status</option>
                                {statusOptions.map((s) => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                        </div>

                        <button
                            onClick={resetFilters}
                            className="h-9 px-3 rounded-lg border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#6B7280] text-sm flex items-center gap-1.5 transition-colors"
                        >
                            <RotateCcw size={14} />
                            <span>Reset</span>
                        </button>

                        <button
                            onClick={() => setIsImportOpen(true)}
                            className="h-9 px-3 rounded-lg text-white text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                            style={{ background: NAVY }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = NAVY_HOVER)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = NAVY)}
                        >
                            <Upload size={14} />
                            <span>Import</span>
                        </button>

                        <button
                            onClick={async () => {
                                try {
                                    const response = await api.get('/admin/students/export', {
                                        responseType: 'blob',
                                    });
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', 'data-siswa.xlsx');
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    window.URL.revokeObjectURL(url);
                                    setNotice('Data berhasil diekspor.');
                                } catch (err) {
                                    setNotice('Gagal mengekspor data.');
                                }
                            }}
                            className="h-9 px-3 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F5F7FA] text-[#6B7280] text-sm flex items-center gap-1.5 transition-colors"
                        >
                            <Download size={14} />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-[#9CA3AF] text-sm">Memuat data...</div>
                ) : filteredStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                        <div className="w-14 h-14 rounded-full bg-[#F5F7FA] flex items-center justify-center text-[#9CA3AF] mb-3">
                            <Inbox size={28} />
                        </div>
                        <h3 className="text-base font-semibold text-[#1F2937]">
                            {students.length === 0 ? 'Belum ada data siswa.' : 'Tidak ada siswa yang cocok dengan filter.'}
                        </h3>
                        <p className="text-sm text-[#6B7280] max-w-sm mt-1 mb-4">
                            {students.length === 0
                                ? 'Mulai tambahkan siswa untuk mengaktifkan pelacakan presensi kelas.'
                                : 'Coba ubah kata kunci pencarian atau reset filter.'}
                        </p>
                        {students.length === 0 && (
                            <button
                                onClick={openCreateModal}
                                className="px-3.5 py-1.5 rounded-lg text-white text-sm font-medium flex items-center gap-2"
                                style={{ background: NAVY }}
                            >
                                <Plus size={14} />
                                <span>Tambah Siswa</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F5F7FA] border-b border-[#E5E7EB] text-[11px] uppercase tracking-wide text-[#6B7280]">
                                    <th className="py-3 px-4 font-semibold">NIS</th>
                                    <th className="py-3 px-4 font-semibold">Nama Siswa</th>
                                    <th className="py-3 px-4 font-semibold">Jenis Kelamin</th>
                                    <th className="py-3 px-4 font-semibold">Kelas</th>
                                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                                    <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB] text-sm">
                                {pagedStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-[#F5F7FA]/60 transition-colors">
                                        <td className="py-2.5 px-4 font-medium text-[#1F2937]">{student.nis}</td>
                                        <td className="py-2.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs text-white shrink-0"
                                                    style={{ background: NAVY }}
                                                >
                                                    {initials(student.name)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-[#1F2937] leading-tight">{student.name}</span>
                                                    <span className="text-[11px] text-[#6B7280]">{student.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-4 text-[#1F2937]">{student.gender || '-'}</td>
                                        <td className="py-2.5 px-4 text-[#1F2937] font-medium">{student.class_name}</td>
                                        <td className="py-2.5 px-4 text-center">
                                            {student.status === 'nonaktif' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                                    Nonaktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Aktif
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    disabled
                                                    title="Fitur detail belum tersedia"
                                                    className="p-1.5 text-[#D1D5DB] rounded cursor-not-allowed"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(student)}
                                                    title="Edit Data"
                                                    className="p-1.5 text-[#6B7280] hover:text-[#1E3A5F] hover:bg-[#F5F7FA] rounded transition-colors"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(student)}
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

                {filteredStudents.length > 0 && (
                    <div className="px-4 py-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#6B7280]">
                        <span>
                            Menampilkan{' '}
                            <strong className="text-[#1F2937] font-semibold">
                                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredStudents.length)}
                            </strong>{' '}
                            dari <strong className="text-[#1F2937] font-semibold">{filteredStudents.length}</strong> siswa
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F5F7FA] disabled:opacity-40 transition-colors"
                            >
                                <ChevronLeft size={16} />
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
                                className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F5F7FA] disabled:opacity-40 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <BulkImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                title="Import Siswa"
                templateUrl="/admin/students/import/template"
                importUrl="/admin/students/import"
                templateFilename="template-import-siswa.xlsx"
                columns={[
                    { label: 'NIS', example: '12345' },
                    { label: 'Nama', example: 'Nama Siswa' },
                    { label: 'Email', example: 'siswa@example.com' },
                    { label: 'Jenis Kelamin', example: 'laki-laki' },
                    { label: 'Kelas', example: 'XII PPLG 1' },
                    { label: 'Status', example: 'aktif' },
                ]}
                onImported={() => fetchStudents()}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? 'Edit Siswa' : 'Tambah Siswa Baru'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Nama Lengkap</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-1"
                        />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-1"
                        />
                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email[0]}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Jenis Kelamin</label>
                            <select
                                value={form.gender}
                                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] appearance-none focus:outline-none focus:ring-1"
                            >
                                <option value="">Pilih gender</option>
                                <option value="laki-laki">Laki-laki</option>
                                <option value="perempuan">Perempuan</option>
                            </select>
                            {errors.gender && <p className="text-xs text-red-600 mt-1">{errors.gender[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] appearance-none focus:outline-none focus:ring-1"
                            >
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                            {errors.status && <p className="text-xs text-red-600 mt-1">{errors.status[0]}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                            Nomor Induk Siswa (NIS)
                        </label>
                        <input
                            type="text"
                            value={form.nis}
                            onChange={(e) => setForm({ ...form, nis: e.target.value })}
                            className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-1"
                        />
                        {errors.nis && <p className="text-xs text-red-600 mt-1">{errors.nis[0]}</p>}
                        {!editingId && (
                            <p className="text-xs text-[#9CA3AF] mt-1">NIS juga akan menjadi password default siswa.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Kelas</label>
                        <div className="relative">
                            <select
                                value={form.class_id}
                                onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                                className="w-full h-9 pl-3 pr-8 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] appearance-none focus:outline-none"
                            >
                                <option value="">Pilih kelas</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                        </div>
                        {errors.class_id && <p className="text-xs text-red-600 mt-1">{errors.class_id[0]}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ background: NAVY }}
                        onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = NAVY_HOVER; }}
                        onMouseLeave={(e) => (e.currentTarget.style.background = NAVY)}
                    >
                        {submitting ? 'Menyimpan...' : 'Simpan Data'}
                    </button>
                </form>
            </Modal>

            {deleteTarget && (
                <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl max-w-sm w-full p-5">
                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                                <TriangleAlert size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-[#1F2937]">Hapus Data Siswa?</h3>
                                <p className="text-sm text-[#6B7280] mt-1.5">
                                    Apakah Anda yakin ingin menghapus{' '}
                                    <strong className="text-[#1F2937]">{deleteTarget.name}</strong>? Tindakan ini
                                    tidak dapat dibatalkan.
                                </p>
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
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
