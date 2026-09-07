import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

export default function DashboardLayout({ title, navItems }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const linkClass = ({ isActive }) =>
        `block px-4 py-2 rounded-lg text-sm font-medium ${
            isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
        }`;

    return (
        <div className="min-h-screen flex bg-gray-50">
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 z-20 lg:hidden"
                />
            )}

            <aside
                className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 p-4 transform transition-transform duration-200 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
            >
                <h2 className="text-lg font-bold text-gray-900 mb-6">{title}</h2>
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={linkClass}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-500 hover:text-gray-700 text-xl"
                            aria-label="Buka menu"
                        >
                            ☰
                        </button>
                        <span className="text-sm text-gray-500">Halo, {user?.name}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-red-600 font-medium hover:underline"
                    >
                        Keluar
                    </button>
                </header>

                <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}