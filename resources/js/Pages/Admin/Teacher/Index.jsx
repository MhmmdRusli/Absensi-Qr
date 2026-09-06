import { useEffect, useState } from 'react';
import api from '../../../Lib/axios';
import Modal from '../../../Components/Modal';

const emptyForm = { name: '', email: '', nip: '' };

export default function TeacherIndex() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState('');

    const fetchTeachers = async () => {
        const response = await api.get('/admin/teachers');
        setTeachers(response.data.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const openCreateModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (teacher) => {
        setEditingId(teacher.id);
        setForm({ name: teacher.name, email: teacher.email, nip: teacher.nip });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors({});

        try {
            if (editingId) {
                const response = await api.put(`/admin/teachers/${editingId}`, form);
                setNotice(response.data.message);
            } else {
                const response = await api.post('/admin/teachers', form);
                setNotice(response.data.message);
            }

            setIsModalOpen(false);
            fetchTeachers();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            }
        }
    };

    const handleDelete = async (teacher) => {
        if (!confirm(`Hapus guru "${teacher.name}"? Data tidak bisa dikembalikan.`)) {
            return;
        }

        await api.delete(`/admin/teachers/${teacher.id}`);
        setNotice('Guru berhasil dihapus.');
        fetchTeachers();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Guru</h1>
                    <p className="text-gray-500 mt-1">Kelola data guru di sini.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                    + Tambah Guru
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
                ) : teachers.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Belum ada data guru.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-200">
                                <th className="px-5 py-3 font-medium">Nama</th>
                                <th className="px-5 py-3 font-medium">NIP</th>
                                <th className="px-5 py-3 font-medium">Email</th>
                                <th className="px-5 py-3 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((teacher) => (
                                <tr key={teacher.id} className="border-b border-gray-100 last:border-0">
                                    <td className="px-5 py-3">{teacher.name}</td>
                                    <td className="px-5 py-3">{teacher.nip}</td>
                                    <td className="px-5 py-3">{teacher.email}</td>
                                    <td className="px-5 py-3 text-right space-x-3">
                                        <button
                                            onClick={() => openEditModal(teacher)}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(teacher)}
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
                title={editingId ? 'Edit Guru' : 'Tambah Guru'}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                        <input
                            type="text"
                            value={form.nip}
                            onChange={(e) => setForm({ ...form, nip: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        {errors.nip && <p className="text-xs text-red-600 mt-1">{errors.nip[0]}</p>}
                        {!editingId && (
                            <p className="text-xs text-gray-400 mt-1">NIP juga akan menjadi password default guru.</p>
                        )}
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