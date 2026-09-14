import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import {
    IconDashboard, IconStudents, IconTeachers, IconClasses,
    IconSubjects, IconReports, IconLogout, IconCalendar, IconBell,
    IconHelp, IconChevronDown, IconClock, IconCheckCircle,
} from '../Components/Icons';

const primaryNav = { to: '/admin/dashboard', label: 'Dashboard', icon: IconDashboard };

const masterData = [
    { to: '/admin/students', label: 'Data Siswa', icon: IconStudents },
    { to: '/admin/teachers', label: 'Data Guru', icon: IconTeachers },
    { to: '/admin/classes', label: 'Data Kelas', icon: IconClasses },
    { to: '/admin/subjects', label: 'Mata Pelajaran', icon: IconSubjects },
];

const laporanNav = [
    { to: '/admin/reports', label: 'Laporan', icon: IconReports },
];

const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

function NavItem({ to, label, icon: Icon }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                        ? 'bg-slate-100 text-[#0f2942] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
            }
        >
            <Icon />
            <span>{label}</span>
        </NavLink>
    );
}

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [notice, setNotice] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    const pageLabel = {
        '/admin/dashboard': 'Dashboard',
        '/admin/students': 'Data Siswa',
        '/admin/teachers': 'Data Guru',
        '/admin/classes': 'Data Kelas',
        '/admin/subjects': 'Mata Pelajaran',
        '/admin/reports': 'Laporan',
    };
    const currentPage = pageLabel[location.pathname] || 'Dashboard';

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const initials = (user?.name ?? 'A')
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const notifications = [
        { id: 1, text: 'Sesi absensi kelas XI PPLG dimulai', time: '10 menit lalu', read: false },
        { id: 2, text: 'Laporan absensi mingguan sudah di-generate', time: '2 jam lalu', read: true },
        { id: 3, text: 'Data siswa kelas X telah diperbarui', time: 'Kemarin', read: true },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* SIDEBAR */}
            <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col justify-between bg-white border-r border-slate-200 z-30 shrink-0">
                <div>
                    <div className="h-16 px-5 border-b border-slate-200 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#0f2942] text-white flex items-center justify-center">
                            <IconStudents />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold text-[#0f2942]">Sistem Absensi</span>
                            <span className="text-[11px] text-slate-400">Panel Admin</span>
                        </div>
                    </div>

                    <nav className="p-3 pt-4 space-y-1">
                        <NavItem {...primaryNav} />

                        <div className="pt-4 pb-1 px-3">
                            <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
                                Master Data
                            </span>
                        </div>
                        {masterData.map((item) => (
                            <NavItem key={item.to} {...item} />
                        ))}

                        <div className="pt-4 pb-1 px-3">
                            <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
                                Laporan
                            </span>
                        </div>
                        {laporanNav.map((item) => (
                            <NavItem key={item.to} {...item} />
                        ))}
                    </nav>
                </div>

                <div className="p-3 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#0f2942] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                                {initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm text-slate-800 truncate">{user?.name}</span>
                                <span className="text-[11px] text-slate-400">Administrator</span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Keluar"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-red-600 transition-colors shrink-0"
                        >
                            <IconLogout />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen min-w-0">
                <header className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-200 h-16 px-6 flex items-center justify-between z-20">
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900 leading-tight">
                            {currentPage}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600">
                            <IconCalendar />
                            <span>{today}</span>
                        </div>
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => { setShowNotifications(!showNotifications); }}
                                className="relative p-2 rounded-lg text-slate-400 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                            >
                                <IconBell />
                                {!notifications.every((n) => n.read) && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
                                )}
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-[#1F2937]">Notifikasi</span>
                                        <button
                                            onClick={() => setShowNotifications(false)}
                                            className="p-1 rounded hover:bg-slate-100 text-[#6B7280]"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.map((n) => (
                                            <div key={n.id} className={`px-4 py-3 border-b border-slate-50 ${n.read ? 'bg-white' : 'bg-blue-50/50'}`}>
                                                <p className="text-xs text-[#1F2937]">{n.text}</p>
                                                <p className="text-[10px] text-[#9CA3AF] mt-1 flex items-center gap-1">
                                                    <IconClock size={10} />
                                                    {n.time}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-2 border-t border-slate-100 text-center">
                                        <button
                                            onClick={() => setShowNotifications(false)}
                                            className="text-xs text-[#1E3A5F] font-medium hover:underline"
                                        >
                                            Lihat Semua
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => { setShowHelp(!showHelp); setShowNotifications(false); }}
                            className="p-2 rounded-lg text-slate-400 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                        >
                            <IconHelp />
                        </button>
                        <div className="h-6 w-px bg-slate-200" />
                        <div className="relative">
                            <button
                                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                                className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-7 h-7 rounded-full bg-[#0f2942] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {initials}
                                </div>
                                <span className="text-sm text-slate-700 hidden sm:inline">{user?.name}</span>
                                <IconChevronDown className="text-slate-400" />
                            </button>
                            {showProfile && (
                                <div className="absolute right-0 top-12 w-52 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <p className="text-sm font-semibold text-[#1F2937]">{user?.name}</p>
                                        <p className="text-[11px] text-[#9CA3AF]">Administrator</p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={() => { setShowProfile(false); navigate('/admin/profile'); }}
                                            className="w-full text-left px-4 py-2 text-sm text-[#1F2937] hover:bg-slate-50 transition-colors flex items-center gap-2"
                                        >
                                            <IconCheckCircle size={14} />
                                            Profil
                                        </button>
                                        <button
                                            onClick={() => { setShowProfile(false); handleLogout(); }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                        >
                                            <IconLogout size={14} />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {showHelp && (
                    <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl max-w-md w-full p-5">
                            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
                                <h3 className="text-base font-semibold text-[#1F2937]">Bantuan</h3>
                                <button onClick={() => setShowHelp(false)} className="text-[#9CA3AF] hover:text-[#1F2937]">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="space-y-3 text-sm text-[#6B7280]">
                                <p><strong className="text-[#1F2937]">1. Dashboard</strong> — Lihat ringkasan dan statistik absensi.</p>
                                <p><strong className="text-[#1F2937]">2. Data Siswa</strong> — Kelola data siswa.</p>
                                <p><strong className="text-[#1F2937]">3. Data Guru</strong> — Kelola data guru.</p>
                                <p><strong className="text-[#1F2937]">4. Data Kelas</strong> — Kelola data kelas dan tingkat.</p>
                                <p><strong className="text-[#1F2937]">5. Mata Pelajaran</strong> — Kelola data mata pelajaran.</p>
                                <p><strong className="text-[#1F2937]">6. Laporan</strong> — Lihat laporan absensi.</p>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => setShowHelp(false)}
                                    className="h-9 px-4 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:bg-[#16304F] transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {notice && (
                    <div className="fixed top-20 right-6 z-50 bg-amber-50 text-amber-700 text-sm px-4 py-2 rounded-lg border border-amber-200 shadow-sm">
                        {notice}
                    </div>
                )}

                <main className="flex-1 p-6 space-y-6 overflow-x-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
