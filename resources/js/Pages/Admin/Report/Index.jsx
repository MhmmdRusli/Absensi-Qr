import { useEffect, useState } from 'react';
import api from '../../../Lib/axios';

const emptyFilters = { tanggal_mulai: '', tanggal_akhir: '', class_id: '', subject_id: '', status: '' };

export default function ReportIndex() {
    const [laporan, setLaporan] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(emptyFilters);

    const fetchOptions = async () => {
        const [classesRes, subjectsRes] = await Promise.all([
            api.get('/classes-list'),
            api.get('/subjects-list'),
        ]);
        setClasses(classesRes.data.data);
        setSubjects(subjectsRes.data.data);
    };

    const fetchLaporan = async () => {
        setLoading(true);
        const response = await api.get('/admin/reports', { params: filters });
        setLaporan(response.data.data);
        setLoading(false);
    };

    const handleExport = () => {
        const params = new URLSearchParams(filters).toString();
        window.location.href = `/api/admin/reports/export?${params}`;
    };

    useEffect(() => {
        fetchOptions();
    }, []);

    useEffect(() => {
        fetchLaporan();
    }, [filters]);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Laporan Absensi</h1>
            <p className="text-gray-500 mb-6">Lihat dan filter seluruh data absensi siswa.</p>

            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap gap-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Tanggal Mulai</label>
                        <input
                            type="date"
                            value={filters.tanggal_mulai}
                            onChange={(e) => setFilters({ ...filters, tanggal_mulai: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Tanggal Akhir</label>
                        <input
                            type="date"
                            value={filters.tanggal_akhir}
                            onChange={(e) => setFilters({ ...filters, tanggal_akhir: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Kelas</label>
                        <select
                            value={filters.class_id}
                            onChange={(e) => setFilters({ ...filters, class_id: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="">Semua Kelas</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Mata Pelajaran</label>
                        <select
                            value={filters.subject_id}
                            onChange={(e) => setFilters({ ...filters, subject_id: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="">Semua Mapel</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Status</label>
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
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters(emptyFilters)}
                            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Reset Filter
                        </button>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Memuat data...</div>
                ) : laporan.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Tidak ada data untuk filter ini.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-200">
                                <th className="px-5 py-3 font-medium">Nama Siswa</th>
                                <th className="px-5 py-3 font-medium">Tanggal</th>
                                <th className="px-5 py-3 font-medium">Kelas</th>
                                <th className="px-5 py-3 font-medium">Mata Pelajaran</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Waktu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {laporan.map((item) => (
                                <tr key={item.id} className="border-b border-gray-100 last:border-0">
                                    <td className="px-5 py-3">{item.nama_siswa}</td>
                                    <td className="px-5 py-3">{item.tanggal}</td>
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