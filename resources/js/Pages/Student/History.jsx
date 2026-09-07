import { useEffect, useState } from 'react';
import api from '../../Lib/axios';

export default function History() {
    const [riwayat, setRiwayat] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ bulan: '', status: '', subject_id: '' });

    const fetchSubjects = async () => {
        const response = await api.get('/subjects-list');
        setSubjects(response.data.data);
    };

    const fetchRiwayat = async () => {
        setLoading(true);
        const response = await api.get('/student/attendance/history', { params: filters });
        setRiwayat(response.data.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        fetchRiwayat();
    }, [filters]);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Riwayat Absensi</h1>
            <p className="text-gray-500 mb-6">Lihat seluruh riwayat kehadiranmu di sini.</p>

            <div className="flex flex-wrap gap-3 mb-6">
                <input
                    type="month"
                    value={filters.bulan}
                    onChange={(e) => setFilters({ ...filters, bulan: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />

                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                    <option value="">Semua Status</option>
                    <option value="hadir">Hadir</option>
                    <option value="sakit">Sakit</option>
                    <option value="izin">Izin</option>
                    <option value="alpa">Alpa</option>
                </select>

                <select
                    value={filters.subject_id}
                    onChange={(e) => setFilters({ ...filters, subject_id: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                    <option value="">Semua Mata Pelajaran</option>
                    {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Memuat data...</div>
                ) : riwayat.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Tidak ada data untuk filter ini.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-200">
                                <th className="px-5 py-3 font-medium">Tanggal</th>
                                <th className="px-5 py-3 font-medium">Mata Pelajaran</th>
                                <th className="px-5 py-3 font-medium">Kelas</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Waktu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riwayat.map((item) => (
                                <tr key={item.id} className="border-b border-gray-100 last:border-0">
                                    <td className="px-5 py-3">{item.tanggal}</td>
                                    <td className="px-5 py-3">{item.mata_pelajaran}</td>
                                    <td className="px-5 py-3">{item.kelas}</td>
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