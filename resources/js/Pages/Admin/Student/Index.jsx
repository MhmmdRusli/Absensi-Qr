import { useEffect, useState } from 'react';
import api from '../../../Lib/axios';
import Modal from '../../../Components/Modal';

const emptyForm = { name: '', email: '', nis: '', class_id: '' };

export default function StudentIndex() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState('');

    const fetchStudents = async () => {
        const response = await api.get('/admin/students');
        setStudents(response.data.data);
        setLoading(false);
    };

    const fetchClasses = async () => {
        const response = await api.get('/admin/classes-list');
        setClasses(response.data.data);
    };

    useEffect(() => {
        fetchStudents();
        fetchClasses();
    }, []);

    const openCreateModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (student) => {
        setEditingId(student.id);
        setForm({
            name: student.name,
            email: student.email,
            nis: student.nis,
            class_id: student.class_id,
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors({});

        try {
            if (editingId) {
                const response = await api.put(`/admin/students/${editingId}`, form);
                setNotice(response.data.message);
            } else {
                const response = await api.post('/admin/students', form);
                setNotice(response.data.message);
            }

            setIsModalOpen(false);
            fetchStudents();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            }
        }
    };

    const handleDelete = async (student) => {
        if (!confirm(`Hapus siswa "${student.name}"? Data tidak bisa dikembalikan.`)) {
            return;
        }

        await api.delete(`/admin/students/${student.id}`);
        setNotice('Siswa berhasil dihapus.');
        fetchStudents();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Siswa</h1>
                    <p className="text-gray-500 mt-1">Kelola data siswa di sini.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                    + Tambah Siswa
                </button>
            </div>

            {notice && (
                <div className="mb-4 bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg">
                    {notice}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200">
                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Memuat data...</div>
                ) : students.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Belum ada data siswa.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-200">
                                <th className="px-5 py-3 font-medium">Nama</th>
                                <th className="px-5 py-3 font-medium">NIS</th>
                                <th className="px-5 py-3 font-medium">Kelas</th>
                                <th className="px-5 py-3 font-medium">Email</th>
                                <th className="px-5 py-3 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id} className="border-b border-gray-100 last:border-0">
                                    <td className="px-5 py-3">{student.name}</td>
                                    <td className="px-5 py-3">{student.nis}</td>
                                    <td className="px-5 py-3">{student.class_name}</td>
                                    <td className="px-5 py-3">{student.email}</td>
                                    <td className="px-5 py-3 text-right space-x-3">
                                        <button
                                            onClick={() => openEditModal(student)}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(student)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? 'Edit Siswa' : 'Tambah Siswa'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                        <input
                            type="text"
                            value={form.nis}
                            onChange={(e) => setForm({ ...form, nis: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        {errors.nis && <p className="text-xs text-red-600 mt-1">{errors.nis[0]}</p>}
                        {!editingId && (
                            <p className="text-xs text-gray-400 mt-1">NIS juga akan menjadi password default siswa.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                        <select
                            value={form.class_id}
                            onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="">Pilih kelas</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.class_id && <p className="text-xs text-red-600 mt-1">{errors.class_id[0]}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                        Simpan
                    </button>
                </form>
            </Modal>
        </div>
    );
}