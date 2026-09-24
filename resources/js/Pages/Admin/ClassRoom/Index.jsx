import { useEffect, useMemo, useState } from 'react';
import api from '../../../Lib/axios';
import Modal from '../../../Components/Modal';
import BulkImportModal from '../../../Components/BulkImportModal';
import {
    Search,
    RotateCcw,
    Download,
    Eye,
    Pencil,
    Trash2,
    Plus,
    Upload,
    DoorOpen,
    CheckCircle2,
    Users,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    TriangleAlert,
    ChevronDown,
    X,
} from 'lucide-react';

const emptyForm = {
    name: '',
    tingkat: '',
    jurusan: '',
    wali_kelas: '',
    status: 'aktif',
};

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
    const [isImportOpen, setIsImportOpen] = useState(false);

    const fetchClasses = async () => {
        try {
            const response = await api.get('/admin/classes');
            setClasses(response.data.data || []);
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
            name: classRoom.name || '',
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

            setNotice(response.data.message || 'Data kelas berhasil disimpan.');
            setIsModalOpen(false);
            await fetchClasses();
        } catch (err) {
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
            await fetchClasses();
        } catch (err) {
            if (err.response?.status === 422) {
                setDeleteError(err.response.data.message || 'Tidak dapat menghapus kelas ini.');
            } else {
                setDeleteError(err.response?.data?.message || 'Gagal menghapus kelas.');
            }
        }
    };

    const filteredClasses = useMemo(() => {
        const query = search.trim().toLowerCase();

        return classes.filter((item) => {
            const matchesSearch = !query || (item.name || '').toLowerCase().includes(query);
            const matchesTingkat = !tingkatFilter || item.tingkat === tingkatFilter;
            const matchesJurusan = !jurusanFilter || item.jurusan === jurusanFilter;
            const matchesStatus = !statusFilter || item.status === statusFilter;

            return matchesSearch && matchesTingkat && matchesJurusan && matchesStatus;
        });
    }, [classes, search, tingkatFilter, jurusanFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredClasses.length / PAGE_SIZE));
    const pagedClasses = filteredClasses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [search, tingkatFilter, jurusanFilter, statusFilter]);

    const totalSiswaKeseluruhan = useMemo(
        () => classes.reduce((sum, item) => sum + (item.total_siswa || 0), 0),
        [classes]
    );

    const totalKelasAktif = useMemo(
        () => classes.filter((item) => (item.status || 'aktif') === 'aktif').length,
        [classes]
    );

    const tingkatOptions = useMemo(() => {
        const values = classes.map((item) => item.tingkat).filter(Boolean);
        return [...new Set(values)].sort();
    }, [classes]);

    const jurusanOptions = useMemo(() => {
        const values = classes.map((item) => item.jurusan).filter(Boolean);
        return [...new Set(values)].sort();
    }, [classes]);

    const statusOptions = useMemo(() => {
        const values = classes.map((item) => item.status).filter(Boolean);
        return [...new Set(values)].sort();
    }, [classes]);

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#0f2942] via-[#173d62] to-[#1f4c7a] p-6 text-white shadow-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-100">
                            master data
                        </span>
                        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Data Kelas</h1>
                        <p className="mt-2 max-w-xl text-sm text-slate-200">
                            Kelola rombel kelas, tingkat, jurusan, dan wali kelas dalam satu tampilan yang lebih konsisten.
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
                    >
                        <Plus size={16} />
                        <span>Tambah Kelas</span>
                    </button>
                </div>
            </div>

            {notice && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                    {notice}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Total Kelas</p>
                            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{classes.length}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                            <DoorOpen size={22} />
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-slate-500">Terdaftar di sistem</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Kelas Aktif</p>
                            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{totalKelasAktif}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CheckCircle2 size={22} />
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-slate-500">Dari {classes.length} kelas</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Total Siswa</p>
                            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{totalSiswaKeseluruhan}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <Users size={22} />
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-slate-500">Tergabung dalam rombel</p>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-3.5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[240px]">
                        <div className="relative flex-1 min-w-[220px] max-w-md">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama kelas..."
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={tingkatFilter}
                                onChange={(e) => setTingkatFilter(e.target.value)}
                                className="h-9 w-32 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm text-slate-900 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            >
                                <option value="">Semua Tingkat</option>
                                {tingkatOptions.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>

                        <div className="relative">
                            <select
                                value={jurusanFilter}
                                onChange={(e) => setJurusanFilter(e.target.value)}
                                className="h-9 w-32 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm text-slate-900 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            >
                                <option value="">Semua Jurusan</option>
                                {jurusanOptions.map((j) => (
                                    <option key={j} value={j}>{j}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>

                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-9 w-32 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm text-slate-900 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            >
                                <option value="">Semua Status</option>
                                {statusOptions.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setSearch('');
                                setTingkatFilter('');
                                setJurusanFilter('');
                                setStatusFilter('');
                            }}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 transition hover:bg-slate-100"
                        >
                            <RotateCcw size={14} />
                            <span>Reset</span>
                        </button>

                        <button
                            onClick={() => setIsImportOpen(true)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0f2942] px-3 text-sm font-medium text-white transition hover:bg-[#173d62]"
                        >
                            <Upload size={14} />
                            <span>Import</span>
                        </button>

                        <button
                            onClick={async () => {
                                try {
                                    const response = await api.get('/admin/classes/export', { responseType: 'blob' });
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', 'data-kelas.csv');
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    window.URL.revokeObjectURL(url);
                                    setNotice('Data kelas berhasil diekspor.');
                                } catch (err) {
                                    setNotice('Gagal mengekspor data kelas.');
                                }
                            }}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 transition hover:bg-slate-100"
                        >
                            <Download size={14} />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-sm text-slate-400">Memuat data...</div>
                ) : filteredClasses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <FolderOpen size={28} />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">
                            {classes.length === 0 ? 'Belum ada data kelas.' : 'Tidak ada kelas yang cocok.'}
                        </h3>
                        <p className="mt-1 max-w-sm text-sm text-slate-500">
                            {classes.length === 0
                                ? 'Mulai tambahkan kelas untuk mengelompokkan data siswa dan jadwal absensi harian.'
                                : 'Coba ubah kata kunci pencarian.'}
                        </p>
                        {classes.length === 0 && (
                            <button
                                onClick={openCreateModal}
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0f2942] px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-[#173d62]"
                            >
                                <Plus size={14} />
                                <span>Tambah Kelas</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                                    <th className="px-4 py-3 font-semibold">Nama Kelas</th>
                                    <th className="px-4 py-3 font-semibold">Tingkat</th>
                                    <th className="px-4 py-3 font-semibold">Jurusan</th>
                                    <th className="px-4 py-3 font-semibold">Wali Kelas</th>
                                    <th className="px-4 py-3 font-semibold">Jumlah Siswa</th>
                                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                                    <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {pagedClasses.map((classRoom) => (
                                    <tr key={classRoom.id} className="transition hover:bg-slate-50">
                                        <td className="px-4 py-3 font-semibold text-[#0f2942]">{classRoom.name}</td>
                                        <td className="px-4 py-3 text-slate-700">{classRoom.tingkat || '-'}</td>
                                        <td className="px-4 py-3 text-slate-700">{classRoom.jurusan || '-'}</td>
                                        <td className="px-4 py-3 text-slate-700">{classRoom.wali_kelas || '-'}</td>
                                        <td className="px-4 py-3 font-medium text-slate-900">{classRoom.total_siswa || 0} Siswa</td>
                                        <td className="px-4 py-3 text-center">
                                            {(classRoom.status === 'aktif' || !classRoom.status) ? (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                                                    {classRoom.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => setDetailTarget(classRoom)}
                                                    title="Lihat Detail"
                                                    className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(classRoom)}
                                                    title="Edit"
                                                    className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(classRoom)}
                                                    title="Hapus"
                                                    className="rounded p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
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
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 sm:flex-row">
                        <span>
                            Menampilkan{' '}
                            <strong className="font-semibold text-slate-900">
                                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredClasses.length)}
                            </strong>{' '}
                            dari <strong className="font-semibold text-slate-900">{filteredClasses.length}</strong> kelas
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                            >
                                <ChevronLeft size={14} /> <span>Prev</span>
                            </button>
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f2942] text-xs font-semibold text-white">
                                {page}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                            >
                                <span>Next</span> <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? 'Edit Kelas' : 'Tambah Kelas'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Kelas</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Contoh: XI PPLG 1"
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name[0]}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tingkat</label>
                            <input
                                type="text"
                                value={form.tingkat}
                                onChange={(e) => setForm({ ...form, tingkat: e.target.value })}
                                placeholder="Contoh: X, XI, XII"
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                            {errors.tingkat && <p className="mt-1 text-xs text-red-600">{errors.tingkat[0]}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Jurusan</label>
                            <input
                                type="text"
                                value={form.jurusan}
                                onChange={(e) => setForm({ ...form, jurusan: e.target.value })}
                                placeholder="Contoh: PPLG"
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                            {errors.jurusan && <p className="mt-1 text-xs text-red-600">{errors.jurusan[0]}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Wali Kelas</label>
                            <input
                                type="text"
                                value={form.wali_kelas}
                                onChange={(e) => setForm({ ...form, wali_kelas: e.target.value })}
                                placeholder="Contoh: Pak Ahmad"
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                            {errors.wali_kelas && <p className="mt-1 text-xs text-red-600">{errors.wali_kelas[0]}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                        >
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Nonaktif</option>
                        </select>
                        {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status[0]}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-lg bg-[#0f2942] py-2.5 text-sm font-medium text-white transition hover:bg-[#173d62] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {submitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </form>
            </Modal>

            {detailTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="text-base font-semibold text-slate-900">Detail Kelas</h3>
                            <button onClick={() => setDetailTarget(null)} className="text-slate-400 hover:text-slate-700">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-[#0f2942]">{detailTarget.name}</span>
                                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                            {detailTarget.status || 'Aktif'}
                                        </span>
                                    </div>
                                    <div className="mt-2 space-y-0.5 text-xs text-slate-500">
                                        {detailTarget.tingkat && <p>Tingkat: <strong className="text-slate-800">{detailTarget.tingkat}</strong></p>}
                                        {detailTarget.jurusan && <p>Jurusan: <strong className="text-slate-800">{detailTarget.jurusan}</strong></p>}
                                        {detailTarget.wali_kelas && <p>Wali Kelas: <strong className="text-slate-800">{detailTarget.wali_kelas}</strong></p>}
                                        {detailTarget.status && <p>Status: <strong className="text-slate-800">{detailTarget.status}</strong></p>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-bold text-[#0f2942]">{detailTarget.total_siswa || 0}</span>
                                    <span className="block text-[10px] uppercase tracking-[0.12em] text-slate-400">Siswa</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setDetailTarget(null)}
                                className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
                        <div className="flex items-start gap-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-100 text-red-600">
                                <TriangleAlert size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">Hapus Data Kelas?</h3>
                                <p className="mt-1.5 text-sm text-slate-500">
                                    Apakah Anda yakin ingin menghapus kelas <strong className="text-slate-800">{deleteTarget.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                                </p>
                                {deleteError && (
                                    <p className="mt-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                                        {deleteError}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end gap-2.5">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
                            >
                                Hapus Kelas
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BulkImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                title="Import Kelas"
                templateUrl="/admin/classes/import/template"
                importUrl="/admin/classes/import"
                templateFilename="template-import-kelas.xlsx"
                columns={[
                    { label: 'Nama Kelas', example: 'XII PPLG 1' },
                    { label: 'Tingkat', example: 'XII' },
                    { label: 'Jurusan', example: 'PPLG' },
                    { label: 'Wali Kelas', example: 'Pak Ahmad' },
                    { label: 'Status', example: 'aktif' },
                ]}
                onImported={() => fetchClasses()}
            />
        </div>
    );
}
