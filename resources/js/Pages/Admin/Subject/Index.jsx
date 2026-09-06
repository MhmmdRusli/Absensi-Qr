import { useEffect, useState } from 'react';
import api from '../../../Lib/axios';
import Modal from '../../../Components/Modal';

const emptyForm = { name: '' };

export default function SubjectIndex() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState('');

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

    const handleDelete = async (subject) => {
        if (!confirm(`Hapus mata pelajaran "${subject.name}"?`)) {
            return;
        }

        try {
            await api.delete(`/admin/subjects/${subject.id}`);
            setNotice('Mata pelajaran berhasil dihapus.');
            fetchSubjects();
        } catch (err) {
            if (err.response?.status === 422) {
                alert(err.response.data.message);
            }
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mata Pelajaran</h1>
                    <p className="text-gray-500 mt-1">Kelola data mata pelajaran di sini.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                    + Tambah Mata Pelajaran
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
                ) : subjects.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Belum ada data mata pelajaran.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-200">
                                <th className="px-5 py-3 font-medium">Nama Mata Pelajaran</th>
                                <th className="px-5 py-3 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subject) => (
                                <tr key={subject.id} className="border-b border-gray-100 last:border-0">
                                    <td className="px-5 py-3">{subject.name}</td>
                                    <td className="px-5 py-3 text-right space-x-3">
                                        <button
                                            onClick={() => openEditModal(subject)}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(subject)}
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
                title={editingId ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Mata Pelajaran</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Contoh: Fisika"
                        />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name[0]}</p>}
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