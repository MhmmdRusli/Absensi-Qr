import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

export default function StudentLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const linkClass = ({ isActive }) =>
        `block px-4 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
        }`;

    return (
        <div className="min-h-screen flex bg-gray-50">
            <aside className="w-64 bg-white border-r border-gray-200 p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Panel Siswa</h2>
                <nav className="space-y-1">
                    <NavLink to="/student/dashboard" className={linkClass}>Dashboard</NavLink>
                    <NavLink to="/student/history" className={linkClass}>Riwayat Absensi</NavLink>
                    <NavLink to="/student/scan" className={linkClass}>Scan QR</NavLink>
                </nav>
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Halo, {user?.name}</span>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-red-600 font-medium hover:underline"
                    >
                        Keluar
                    </button>
                </header>

                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}