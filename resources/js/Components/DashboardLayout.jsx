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
            isActive ? 'bg-blue-600 text-white' : 'text-[#374151] hover:bg-[#F3F4F6]'
        }`;

    return (
        <div className="min-h-screen flex bg-[#F5F7FA]">
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 z-20 lg:hidden"
                />
            )}

            <aside
                className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-[#E5E7EB] p-4 transform transition-transform duration-200 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
            >
                <h2 className="text-lg font-bold text-[#1F2937] mb-6">{title}</h2>
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
                <header className="bg-white border-b border-[#E5E7EB] px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-[#6B7280] hover:text-[#374151] text-xl"
                            aria-label="Buka menu"
                        >
                            ☰
                        </button>
                        <span className="text-sm text-[#6B7280]">Halo, {user?.name}</span>
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