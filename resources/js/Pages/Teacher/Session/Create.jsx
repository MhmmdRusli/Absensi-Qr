import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../Lib/axios';

export default function SessionCreate() {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [form, setForm] = useState({
        class_id: '',
        subject_id: '',
        date: new Date().toISOString().slice(0, 10),
        start_time: '',
        end_time: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOptions = async () => {
            const [classesRes, subjectsRes] = await Promise.all([
                api.get('/classes-list'),
                api.get('/subjects-list'),
            ]);
            setClasses(classesRes.data.data);
            setSubjects(subjectsRes.data.data);
        };

        fetchOptions();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        try {
            const response = await api.post('/teacher/sessions', form);
            navigate(`/teacher/sessions/${response.data.data.id}`);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-lg">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Buat Sesi Absensi</h1>
            <p className="text-gray-500 mb-6">Isi detail sesi absensi yang akan dimulai.</p>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                    <select
                        value={form.subject_id}
                        onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="">Pilih mata pelajaran</option>
                        {subjects.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    {errors.subject_id && <p className="text-xs text-red-600 mt-1">{errors.subject_id[0]}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date[0]}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Mulai</label>
                        <input
                            type="time"
                            value={form.start_time}
                            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        {errors.start_time && <p className="text-xs text-red-600 mt-1">{errors.start_time[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Selesai</label>
                        <input
                            type="time"
                            value={form.end_time}
                            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        {errors.end_time && <p className="text-xs text-red-600 mt-1">{errors.end_time[0]}</p>}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'Memproses...' : 'Mulai Absensi'}
                </button>
            </form>
        </div>
    );
}