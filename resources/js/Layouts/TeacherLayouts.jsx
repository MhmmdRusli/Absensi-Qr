import DashboardLayout from '../Components/DashboardLayout';

const navItems = [
    { to: '/teacher/dashboard', label: 'Dashboard' },
    { to: '/teacher/sessions', label: 'Sesi Absensi' },
];

export default function TeacherLayout() {
    return <DashboardLayout title="Panel Guru" navItems={navItems} />;
}