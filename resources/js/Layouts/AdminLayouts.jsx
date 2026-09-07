import DashboardLayout from '../Components/DashboardLayout';

const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/students', label: 'Data Siswa' },
    { to: '/admin/teachers', label: 'Data Guru' },
    { to: '/admin/classes', label: 'Data Kelas' },
    { to: '/admin/subjects', label: 'Mata Pelajaran' },
    { to: '/admin/reports', label: 'Laporan' },
];

export default function AdminLayout() {
    return <DashboardLayout title="Panel Admin" navItems={navItems} />;
}