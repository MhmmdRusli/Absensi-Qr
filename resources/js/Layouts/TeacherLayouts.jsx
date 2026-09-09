import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    QrCode,
    History,
    Users,
    CalendarRange,
    BarChart3,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronRight,
    CalendarDays,
    GraduationCap,
    Plus,
    HelpCircle,
} from 'lucide-react';
import { useAuth } from '../Context/AuthContext';

const navItems = [
    {
        to: '/teacher/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        available: true,
    },

    {
        to: '/teacher/sessions',
        label: 'Sesi Absensi',
        icon: QrCode,
        available: true,
    },

    {
        to: '/teacher/history',
        label: 'Riwayat Absensi',
        icon: History,
        available: true,
    },

    {
        to: '/teacher/students',
        label: 'Data Siswa',
        icon: Users,
        available: false,
    },

    {
        to: '/teacher/schedule',
        label: 'Jadwal Pelajaran',
        icon: CalendarRange,
        available: false,
    },

    {
        to: '/teacher/reports',
        label: 'Laporan & Rekap',
        icon: BarChart3,
        available: false,
    },
];

function getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function TeacherLayouts() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const currentLabel =
        navItems.find((item) => location.pathname.startsWith(item.to))?.label || 'Dashboard';

    const today = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#F5F7FA] text-[#1F2937]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed top-0 left-0 h-screen w-64 flex flex-col justify-between z-40 bg-white border-r border-[#E5E7EB] transition-transform duration-200 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
            >
                <div className="flex flex-col py-4 px-3 overflow-y-auto">
                    <div className="flex items-center justify-between px-2 py-1 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] text-white flex items-center justify-center shadow-sm">
                                <GraduationCap size={18} />
                            </div>
                            <div>
                                <h1 className="text-[15px] font-semibold text-[#1E3A5F] leading-tight tracking-tight">
                                    EduAttend Pro
                                </h1>
                                <p className="text-[10px] text-[#6B7280] font-medium leading-tight">
                                    Panel Guru
                                </p>
                            </div>
                        </div>
                        <button className="lg:hidden text-[#6B7280]" onClick={() => setSidebarOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="px-1 mb-4">
                        <button
                            onClick={() => navigate('/teacher/sessions/create')}
                            className="w-full h-9 bg-[#1E3A5F] hover:bg-[#16304F] text-white text-[12px] font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
                        >
                            <Plus size={16} />
                            <span>Buat Sesi Absensi</span>
                        </button>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            if (!item.available) {
                                return (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setSidebarOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-[#F5F7FA] text-[#1E3A5F] border-l-2 border-[#1E3A5F]'
                                                    : 'text-[#1F2937] hover:bg-[#F5F7FA]'
                                            }`
                                        }
                                    >
                                        <Icon size={18} />
                                        <span className="flex-1">{item.label}</span>
                                    </NavLink>
                                );
                            }
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors ${
                                            isActive
                                                ? 'bg-[#F5F7FA] text-[#1E3A5F] border-l-2 border-[#1E3A5F]'
                                                : 'text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F5F7FA]'
                                        }`
                                    }
                                >
                                    <Icon size={18} />
                                    <span className="flex-1">{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-3 border-t border-[#E5E7EB]">
                    <div className="flex items-center gap-2 p-2 rounded-lg mb-1">
                        <div className="w-9 h-9 rounded-full bg-[#DEE9FC] text-[#1E3A5F] font-bold text-xs flex items-center justify-center border border-[#E5E7EB]">
                            {getInitials(user?.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-[#1F2937] truncate">
                                {user?.name || 'Guru'}
                            </p>
                            <p className="text-[11px] text-[#6B7280] truncate">Guru</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-[12px] font-semibold"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <div className="lg:ml-64 flex flex-col min-h-screen">
                <header className="sticky top-0 h-14 w-full z-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-2 text-[#6B7280]">
                        <button className="lg:hidden text-[#6B7280] mr-1" onClick={() => setSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <span className="text-[13px] hidden sm:inline">Beranda</span>
                        <ChevronRight size={14} className="hidden sm:inline" />
                        <span className="text-[13px] font-semibold text-[#1F2937]">{currentLabel}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-[#F5F7FA] border border-[#E5E7EB] text-[#6B7280] text-[11px] font-medium">
                            <CalendarDays size={14} className="text-[#1E3A5F]" />
                            <span>{today}</span>
                        </div>
                        <button className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1E3A5F] hover:bg-[#F5F7FA]" title="Notifikasi">
                            <Bell size={20} />
                        </button>
                        <button className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1E3A5F] hover:bg-[#F5F7FA]" title="Bantuan">
                            <HelpCircle size={20} />
                        </button>
                        <div className="h-5 w-[1px] bg-[#E5E7EB]" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white font-bold text-xs flex items-center justify-center">
                                {getInitials(user?.name)}
                            </div>
                            <span className="hidden md:inline text-[12px] font-semibold text-[#1F2937]">
                                {user?.name || 'Guru'} (Guru)
                            </span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}