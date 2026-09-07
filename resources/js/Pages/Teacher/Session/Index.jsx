import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../Lib/axios';

export default function SessionIndex() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            const response = await api.get('/teacher/sessions');
            setSessions(response.data.data);
            setLoading(false);
        };

        fetchSessions();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Sesi Absensi</h1>

            <div className="bg-white rounded-xl border border-gray-200">
                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Memuat data...</div>
                ) : sessions.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Belum ada sesi absensi.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-200">
                                <th className="px-5 py-3 font-medium">Kelas</th>
                                <th className="px-5 py-3 font-medium">Mata Pelajaran</th>
                                <th className="px-5 py-3 font-medium">Tanggal</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((s) => (
                                <tr key={s.id} className="border-b border-gray-100 last:border-0">
                                    <td className="px-5 py-3">{s.kelas}</td>
                                    <td className="px-5 py-3">{s.mata_pelajaran}</td>
                                    <td className="px-5 py-3">{s.tanggal}</td>
                                    <td className="px-5 py-3">
                                        <span className={s.status === 'active' ? 'text-green-600 font-medium' : 'text-gray-400'}>
                                            {s.status === 'active' ? 'Aktif' : 'Ditutup'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <Link to={`/teacher/sessions/${s.id}`} className="text-blue-600 hover:underline">
                                            Lihat
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}