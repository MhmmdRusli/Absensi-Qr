import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Loader2, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            const user = await login(email, password);

            setSuccess('Berhasil masuk! Mengarahkan...');
            
            setTimeout(() => {
                if (user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (user.role === 'teacher') {
                    navigate('/teacher/dashboard');
                } else {
                    navigate('/student/dashboard');
                }
            }, 800);
        } catch (err) {
            setError('Email atau password salah. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = (focused) => `
        w-full px-4 py-3.5
        bg-white
        border-2 rounded-xl
        text-sm text-[#1F2937]
        placeholder:text-[#9CA3AF]
        transition-all duration-200
        focus:outline-none
        ${focused
            ? 'border-[#1E3A5F] shadow-[0_0_0_3px_rgba(30,58,95,0.15)]'
            : 'border-[#E5E7EB] hover:border-[#D1D5DB]'}
    `;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F4F8] via-[#FFFFFF] to-[#E8EDF3]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1E3A5F]/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#3B82F6]/5 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative w-full max-w-md px-4">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#E5E7EB] p-8 sm:p-10">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-[#1E3A5F]/25 mb-4">
                            <GraduationCap size={28} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#1E3A5F] leading-tight tracking-tight">
                            EduAttend Pro
                        </h1>
                        <p className="text-sm text-[#6B7280] font-medium mt-1">
                            Sistem Absensi Siswa
                        </p>
                    </div>

                    <div className="space-y-2 mb-8">
                        <h2 className="text-lg font-semibold text-[#1F2937] text-center">
                            Selamat Datang Kembali
                        </h2>
                        <p className="text-sm text-[#6B7280] text-center">
                            Masukkan kredensial Anda untuk melanjutkan
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-2">
                                Alamat Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors duration-200" size={20} aria-hidden="true" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                    required
                                    autoComplete="email"
                                    placeholder="nama@contoh.com"
                                    className={`${inputStyle(emailFocused)} pl-12 pr-4`}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#374151] mb-2">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors duration-200" size={20} aria-hidden="true" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    required
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className={`${inputStyle(passwordFocused)} pl-12 pr-12`}
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 animate-in slide-in-from-top-2 duration-200" role="alert">
                                <AlertCircle size={18} className="flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 animate-in slide-in-from-top-2 duration-200" role="status">
                                <CheckCircle size={18} className="flex-shrink-0" />
                                <span>{success}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`
                                w-full py-3.5 rounded-xl text-sm font-semibold
                                transition-all duration-200
                                focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:ring-offset-2
                                ${isSubmitting
                                    ? 'bg-[#1E3A5F]/70 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#1E3A5F] to-[#3B82F6] text-white hover:from-[#16304F] hover:to-[#2563EB] shadow-lg shadow-[#1E3A5F]/25 hover:shadow-xl hover:shadow-[#1E3A5F]/30 active:scale-[0.98]'
                                }
                            `}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={18} className="animate-spin" />
                                    Memproses...
                                </span>
                            ) : (
                                'Masuk'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[#E5E7EB] text-center">
                        <p className="text-sm text-[#6B7280]">
                            Belum punya akun?{' '}
                            <span className="text-[#1E3A5F] font-medium cursor-pointer hover:underline">
                                Hubungi administrator
                            </span>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-[#9CA3AF] mt-6">
                    © {new Date().getFullYear()} EduAttend Pro. Hak cipta dilindungi.
                </p>
            </div>
        </div>
    );
}