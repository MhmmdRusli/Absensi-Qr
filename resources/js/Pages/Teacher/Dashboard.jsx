import { useEffect, useState } from 'react';
import api from '../../Lib/axios';
import StatCard from '../../Components/StatCard';
import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            const response = await api.get('/teacher/dashboard');
            setStats(response.data.stats);
            setLoading(false);
        };

        fetchDashboard();
    }, []);

    const navigate = useNavigate();

    const handleBuatSesi = () => {
        navigate('/teacher/sessions/create');
    };

    if (loading) {
        return <p className="text-gray-500">Memuat data...</p>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Guru</h1>
                    <p className="text-gray-500 mt-1">Selamat datang di panel guru.</p>
                </div>
                <button
                    onClick={handleBuatSesi}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                    + Buat Sesi Absensi
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Kelas" value={stats.total_kelas} />
                <StatCard label="Absensi Hari Ini" value={stats.absensi_hari_ini} />
                <StatCard label="Sesi Absensi Aktif" value={stats.sesi_aktif} />
                <StatCard label="Jumlah Siswa Hadir" value={stats.siswa_hadir_hari_ini} />
            </div>
        </div>
    );
}