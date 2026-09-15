import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const user = await login(email, password);

            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role === 'teacher') {
                navigate('/teacher/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            setError('Email atau password salah.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-[#E5E7EB]">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-12 h-12 rounded-lg bg-[#1E3A5F] text-white flex items-center justify-center shadow-sm mb-3">
                        <GraduationCap size={24} />
                    </div>
                    <h1 className="text-xl font-semibold text-[#1E3A5F] leading-tight">
                        EduAttend Pro
                    </h1>
                    <p className="text-[11px] text-[#6B7280] font-medium leading-tight">
                        Sistem Absensi Siswa
                    </p>
                </div>

                <h2 className="text-lg font-semibold text-[#1F2937] mb-1">
                    Masuk ke Akun Anda
                </h2>
                <p className="text-sm text-[#6B7280] mb-6">
                    Masukkan kredensial Anda untuk melanjutkan
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#6B7280] mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#6B7280] mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-colors"
                        />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#1E3A5F] hover:bg-[#16304F] text-white py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>
            </div>
        </div>
    );
}