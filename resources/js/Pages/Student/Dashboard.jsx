import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../Lib/axios';
import StatCard from '../../Components/StatCard';

export default function StudentDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            const response = await api.get('/student/dashboard');
            setData(response.data);
            setLoading(false);
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return <p className="text-gray-500">Memuat data...</p>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Halo, {data.nama}</h1>
            <p className="text-gray-500 mt-1 mb-6">Kelas: {data.kelas}</p>

            <button
                onClick={() => navigate('/student/scan')}
                className="bg-blue-600 text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 mb-6"
            >
                Scan QR Absensi
            </button>

            <h2 className="text-sm font-semibold text-gray-700 mb-3">Riwayat Absensi</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Hadir" value={data.riwayat.hadir} />
                <StatCard label="Sakit" value={data.riwayat.sakit} />
                <StatCard label="Izin" value={data.riwayat.izin} />
                <StatCard label="Alpa" value={data.riwayat.alpa} />
            </div>
        </div>
    );
}