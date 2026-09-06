import { useEffect, useState } from 'react';
import api from '../../../Lib/axios';
import Modal from '../../../Components/Modal';

const emptyForm = { name: '' };

export default function ClassRoomIndex() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState('');

    const fetchClasses = async () => {
        const response = await api.get('/admin/classes');
        setClasses(response.data.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const openCreateModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (classRoom) => {
        setEditingId(classRoom.id);
        setForm({ name: classRoom.name });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors({});

        try {
            if (editingId) {
                const response = await api.put(`/admin/classes/${editingId}`, form);
                setNotice(response.data.message);
            } else {
                const response = await api.post('/admin/classes', form);
                setNotice(response.data.message);
            }

            setIsModalOpen(false);
            fetchClasses();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? { name: [err.response.data.message] });
            }
        }
    };

    const handleDelete = async (classRoom) => {
        if (!confirm(`Hapus kelas "${classRoom.name}"?`)) {
            return;
        }

        try {
            await api.delete(`/admin/classes/${classRoom.id}`);
            setNotice('Kelas berhasil dihapus.');
            fetchClasses();
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
                    <h1 className="text-2xl font-bold text-gray-900">Data Kelas</h1>
                    <p className="text-gray-500 mt-1">Kelola data kelas di sini.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                    + Tambah Kelas
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
                ) : classes.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Belum ada data kelas.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-200">
                                <th className="px-5 py-3 font-medium">Nama Kelas</th>
                                <th className="px-5 py-3 font-medium">Jumlah Siswa</th>
                                <th className="px-5 py-3 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map((classRoom) => (
                                <tr key={classRoom.id} className="border-b border-gray-100 last:border-0">
                                    <td className="px-5 py-3">{classRoom.name}</td>
                                    <td className="px-5 py-3">{classRoom.total_siswa}</td>
                                    <td className="px-5 py-3 text-right space-x-3">
                                        <button
                                            onClick={() => openEditModal(classRoom)}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(classRoom)}
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
                title={editingId ? 'Edit Kelas' : 'Tambah Kelas'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Contoh: XI PPLG 1"
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