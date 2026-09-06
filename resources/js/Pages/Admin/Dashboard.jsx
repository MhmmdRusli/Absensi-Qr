import { useEffect, useState } from 'react';
import api from '../../Lib/axios';
import StatCard from '../../Components/StatCard';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [absensiTerbaru, setAbsensiTerbaru] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get('/admin/dashboard');
                setStats(response.data.stats);
                setAbsensiTerbaru(response.data.absensi_terbaru);
            } catch (err) {
                setError('Gagal memuat data dashboard.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return <p className="text-gray-500">Memuat data...</p>;
    }

    if (error) {
        return <p className="text-red-600">{error}</p>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-gray-500 mt-1 mb-6">Selamat datang di panel admin.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Siswa" value={stats.total_siswa} />
                <StatCard label="Total Guru" value={stats.total_guru} />
                <StatCard label="Total Kelas" value={stats.total_kelas} />
                <StatCard label="Absensi Hari Ini" value={stats.total_absensi_hari_ini} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 mt-6">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Absensi Terbaru</h2>
                </div>

                {absensiTerbaru.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        Belum ada data absensi.
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-200">
                                <th className="px-5 py-3 font-medium">Nama Siswa</th>
                                <th className="px-5 py-3 font-medium">Kelas</th>
                                <th className="px-5 py-3 font-medium">Mata Pelajaran</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Waktu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {absensiTerbaru.map((item) => (
                                <tr key={item.id} className="border-b border-gray-100 last:border-0">
                                    <td className="px-5 py-3">{item.nama_siswa}</td>
                                    <td className="px-5 py-3">{item.kelas}</td>
                                    <td className="px-5 py-3">{item.mata_pelajaran}</td>
                                    <td className="px-5 py-3 capitalize">{item.status}</td>
                                    <td className="px-5 py-3">{item.waktu ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}