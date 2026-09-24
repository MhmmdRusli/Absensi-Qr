import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import api from '../../../Lib/axios';
import { useAuth } from '../../../Context/AuthContext';
import { IconCheckCircle, IconChevronDown } from '../../../Components/Icons';

export default function ProfileIndex() {
    const { user } = useAuth();
    const [form, setForm] = useState({ name: '', email: '' });
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/profile')
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
            const res = await api.put('/admin/profile', form);
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
        <div className="mx-auto flex max-w-lg flex-col gap-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#0f2942] via-[#173d62] to-[#1f4c7a] p-6 text-white shadow-xl">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-100">
                            profil
                        </span>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white">Profil Saya</h2>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white">
                        {form.name
                            ?.split(' ')
                            .map((s) => s[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                    </div>
                </div>
            </div>

            {notice && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                    {notice}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Masukkan nama"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name[0]}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="Masukkan email"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email[0]}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center justify-center rounded-xl bg-[#0f2942] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173d62] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {submitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </form>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Informasi Akun</h3>
                <div className="space-y-2 text-xs text-slate-600">
                    <p><span className="font-medium text-slate-800">Peran:</span> Administrator</p>
                    <p><span className="font-medium text-slate-800">Terakhir login:</span> {new Date().toLocaleString('id-ID')}</p>
                </div>
            </div>
        </div>
    );
}
