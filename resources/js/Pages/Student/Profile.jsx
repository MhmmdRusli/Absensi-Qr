import { useEffect, useState } from 'react';
import api from '../../Lib/axios';
import { useAuth } from '../../Context/AuthContext';

export default function StudentProfile() {
    const { user } = useAuth();
    const [form, setForm] = useState({ name: '', email: '' });
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/student/profile')
            .then((res) => {
                setForm({
                    name: res.data.user.name,
                    email: res.data.user.email,
                });
            })
            .catch(() => {
                setForm({ name: user?.name || '', email: user?.email || '' });
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setNotice('');
        setSubmitting(true);

        try {
            const res = await api.put('/student/profile', form);
            setNotice(res.data.message);
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

    if (loading) {
        return <div className="p-8 text-center text-[#9CA3AF]">Memuat profil...</div>;
    }

    return (
        <div className="max-w-lg mx-auto">
            {notice && (
                <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-2 rounded-lg border border-emerald-200 mb-6">
                    {notice}
                </div>
            )}

            <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
                <div className="bg-[#1E3A5F] px-6 py-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-white text-base font-semibold">Profil Saya</h2>
                        <p className="text-[#DEE9FC] text-xs mt-1">
                            Kelola informasi profil Anda
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                        {form.name
                            ?.split(' ')
                            .map((s) => s[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Nama</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Masukkan nama"
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
                            placeholder="Masukkan email"
                            className="w-full h-9 px-3 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-1"
                        />
                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email[0]}</p>}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
                            style={{ background: '#1E3A5F' }}
                        >
                            {submitting ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-6 bg-white border border-[#E5E7EB] rounded-xl p-4">
                <h3 className="text-sm font-semibold text-[#1F2937] mb-3">Informasi Akun</h3>
                <div className="space-y-2 text-xs text-[#6B7280]">
                    <p>
                        <span className="font-medium text-[#1F2937]">Peran:</span> Siswa
                    </p>
                    <p>
                        <span className="font-medium text-[#1F2937]">Terakhir login:</span> {new Date().toLocaleString('id-ID')}
                    </p>
                </div>
            </div>
        </div>
    );
}