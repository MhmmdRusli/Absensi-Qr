import DashboardLayout from '../Components/DashboardLayout';

const navItems = [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/history', label: 'Riwayat Absensi' },
];

export default function StudentLayout() {
    return <DashboardLayout title="Panel Siswa" navItems={navItems} />;
}