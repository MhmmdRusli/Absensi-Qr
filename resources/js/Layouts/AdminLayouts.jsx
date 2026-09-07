import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import {
    IconDashboard, IconStudents, IconTeachers, IconClasses,
    IconSubjects, IconReports, IconLogout, IconCalendar, IconBell,
    IconHelp, IconChevronDown,
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
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span>Beranda</span>
                            <span>/</span>
                            <span className="text-[#0f2942] font-medium">Dashboard</span>
                        </div>
                        <h1 className="text-lg font-semibold text-slate-900 leading-tight">
                            Dashboard Admin
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600">
                            <IconCalendar />
                            <span>{today}</span>
                        </div>
                        <button className="p-2 rounded-lg text-slate-400 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                            <IconBell />
                        </button>
                        <button className="p-2 rounded-lg text-slate-400 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                            <IconHelp />
                        </button>
                        <div className="h-6 w-px bg-slate-200" />
                        <div className="flex items-center gap-2 py-1 px-2 rounded-lg cursor-pointer hover:bg-slate-50">
                            <div className="w-7 h-7 rounded-full bg-[#0f2942] text-white flex items-center justify-center text-[10px] font-bold">
                                {initials}
                            </div>
                            <span className="text-sm text-slate-700 hidden sm:inline">{user?.name}</span>
                            <IconChevronDown className="text-slate-400" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 space-y-6 overflow-x-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}