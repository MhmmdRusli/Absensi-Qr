import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Clock, MapPin, X, GraduationCap } from 'lucide-react';
import api from '../../../Lib/axios';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function TeacherScheduleIndex() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [form, setForm] = useState({
        class_id: '',
        subject_id: '',
        day_of_week: 'Senin',
        start_time: '',
        end_time: '',
        room: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const response = await api.get('/teacher/schedules');
            setSchedules(response.data.data || []);
        } catch (err) {
            console.error('Gagal memuat jadwal:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    useEffect(() => {
        if (showModal) {
            Promise.all([api.get('/classes-list'), api.get('/subjects-list')]).then(([c, s]) => {
                setClasses(c.data.data || []);
                setSubjects(s.data.data || []);
            });
        }
    }, [showModal]);

    const grouped = useMemo(() => {
        const map = {};
        DAYS.forEach((day) => {
            map[day] = [];
        });
        schedules.forEach((item) => {
            if (map[item.day_of_week]) {
                map[item.day_of_week].push(item);
            }
        });
        Object.values(map).forEach((list) => {
            list.sort((a, b) => a.start_time.localeCompare(b.start_time));
        });
        return map;
    }, [schedules]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);
        try {
            await api.post('/teacher/schedules', form);
            setShowModal(false);
            setForm({ class_id: '', subject_id: '', day_of_week: 'Senin', start_time: '', end_time: '', room: '' });
            fetchSchedules();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus jadwal ini?')) return;
        try {
            await api.delete(`/teacher/schedules/${id}`);
            fetchSchedules();
        } catch (err) {
            console.error('Gagal menghapus jadwal:', err);
        }
    };

    return (
        <div className="space-y-5">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-[#1E3A5F] tracking-tight">Jadwal Pelajaran</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">
                        Daftar jadwal mengajar yang Anda ampu, dikelompokkan berdasarkan hari.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                    <Plus size={16} />
                    <span>Tambah Jadwal</span>
                </button>
            </div>

            {/* JADWAL GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DAYS.map((day) => {
                    const dayClasses = useMemo(() => {
                        const set = new Set(grouped[day]?.map((i) => i.class) || []);
                        return [...set].sort();
                    }, [grouped, day]);

                    const daySubjects = useMemo(() => {
                        const set = new Set(grouped[day]?.map((i) => i.subject) || []);
                        return [...set].sort();
                    }, [grouped, day]);

                    return (
                        <DayCard
                            key={day}
                            day={day}
                            items={grouped[day] || []}
                            classes={dayClasses}
                            subjects={daySubjects}
                            onDelete={handleDelete}
                        />
                    );
                })}
            </div>

            {/* MODAL TAMBAH JADWAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white w-full max-w-md rounded-lg border border-[#E5E7EB] shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-4 py-3 bg-[#1E3A5F] text-white flex items-center justify-between">
                            <h3 className="text-sm font-bold flex items-center gap-2"><GraduationCap size={18} /> Tambah Jadwal Pelajaran</h3>
                            <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">Hari</label>
                                <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: e.target.value })} className="w-full h-9 rounded border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#1E3A5F]">
                                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">Mata Pelajaran</label>
                                <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="w-full h-9 rounded border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#1E3A5F]">
                                    <option value="">Pilih mata pelajaran</option>
                                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                {errors.subject_id && <p className="text-[11px] text-red-600 mt-1">{errors.subject_id[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">Kelas</label>
                                <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className="w-full h-9 rounded border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#1E3A5F]">
                                    <option value="">Pilih kelas</option>
                                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.class_id && <p className="text-[11px] text-red-600 mt-1">{errors.class_id[0]}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">Mulai</label>
                                    <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="w-full h-9 rounded border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#1E3A5F]" />
                                    {errors.start_time && <p className="text-[11px] text-red-600 mt-1">{errors.start_time[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">Selesai</label>
                                    <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="w-full h-9 rounded border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#1E3A5F]" />
                                    {errors.end_time && <p className="text-[11px] text-red-600 mt-1">{errors.end_time[0]}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-[#6B7280] uppercase mb-1">Ruangan (Opsional)</label>
                                <input type="text" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="Contoh: Lab 1" className="w-full h-9 rounded border border-[#E5E7EB] px-3 text-sm focus:outline-none focus:border-[#1E3A5F]" />
                            </div>
                            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5E7EB]">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#1F2937] text-sm font-medium rounded-lg">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function DayCard({ day, items, classes, subjects, onDelete }) {
    const [subjectFilter, setSubjectFilter] = useState('');
    const [classFilter, setClassFilter] = useState('');

    const filtered = items.filter((item) => {
        const matchSubject = subjectFilter ? item.subject === subjectFilter : true;
        const matchClass = classFilter ? item.class === classFilter : true;
        return matchSubject && matchClass;
    });

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 border-b border-[#E5E7EB] bg-[#F5F7FA]">
                <h3 className="text-sm font-bold text-[#1E3A5F]">{day}</h3>
            </div>
            <div className="p-3 space-y-2.5 flex-1">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-0.5">Mata Pelajaran</label>
                        <select
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                            className="w-full h-8 rounded border border-[#E5E7EB] px-2 text-xs focus:outline-none focus:border-[#1E3A5F]"
                        >
                            <option value="">Semua</option>
                            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-0.5">Kelas</label>
                        <select
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="w-full h-8 rounded border border-[#E5E7EB] px-2 text-xs focus:outline-none focus:border-[#1E3A5F]"
                        >
                            <option value="">Semua</option>
                            {classes.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <p className="text-[11px] text-[#9CA3AF] italic">Tidak ada jadwal</p>
                ) : (
                    <div className="space-y-2">
                        {filtered.map((item) => (
                            <div key={item.id} className="p-2.5 rounded border border-[#E5E7EB] bg-white hover:bg-[#F8FAFC] transition-colors">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-[#1F2937]">{item.subject}</p>
                                        <p className="text-[11px] text-[#6B7280] font-medium">{item.class}</p>
                                        <div className="flex items-center gap-1 text-[11px] text-[#6B7280]">
                                            <Clock size={12} />
                                            <span>{item.start_time} - {item.end_time}</span>
                                        </div>
                                        {item.room && (
                                            <div className="flex items-center gap-1 text-[11px] text-[#6B7280]">
                                                <MapPin size={12} />
                                                <span>{item.room}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="text-[#9CA3AF] hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                                        title="Hapus"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
