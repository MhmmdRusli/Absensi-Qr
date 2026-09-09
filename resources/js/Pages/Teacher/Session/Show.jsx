import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
    AlertTriangle,
    X,
    Loader2,
} from 'lucide-react';
import api from '../../../Lib/axios';

const NAVY = '#1E3A5F';
const NAVY_HOVER = '#16304F';

export default function SessionShow() {
    const { id } = useParams();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const fetchSession = async () => {
        const response = await api.get(`/teacher/sessions/${id}`);
        setSession(response.data.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchSession();

        const interval = setInterval(fetchSession, 5000);
        return () => clearInterval(interval);
    }, [id]);

    const handleTutupAbsensi = async () => {
        setShowConfirm(false);
        setIsClosing(true);
        await api.post(`/teacher/sessions/${id}/close`);
        await fetchSession();
        setIsClosing(false);
    };

    if (loading) {
        return <p className="text-gray-500">Memuat data...</p>;
    }

    return (
        <div className="max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Absensi {session.kelas}
            </h1>
            <p className="text-gray-500 mb-6">{session.mata_pelajaran}</p>

            <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center mb-6">
                {session.status === 'active' ? (
                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                        <QRCodeSVG value={session.qr_token} size={220} />
                    </div>
                ) : (
                    <p className="text-gray-400 py-10">QR Code tidak lagi ditampilkan — sesi sudah ditutup.</p>
                )}

                <p className="mt-4 text-sm text-gray-500">
                    Sesi:{' '}
                    <span className={session.status === 'active' ? 'text-green-600 font-medium' : 'text-gray-400 font-medium'}>
                        {session.status === 'active' ? 'Aktif' : 'Ditutup'}
                    </span>
                </p>
                <p className="text-sm text-gray-500 mb-4">
                    Waktu: {session.waktu_mulai} - {session.waktu_selesai}
                </p>

                {session.status === 'active' && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={isClosing}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                        {isClosing ? 'Menutup...' : 'Tutup Absensi'}
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">Daftar Siswa</h2>
                    <span className="text-sm text-gray-500">Hadir: {session.total_hadir} / {session.total_siswa} siswa</span>
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-200">
                            <th className="px-5 py-2 font-medium">Nama</th>
                            <th className="px-5 py-2 font-medium">Status</th>
                            <th className="px-5 py-2 font-medium">Waktu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {session.siswa.map((s, index) => (
                            <tr key={index} className="border-b border-gray-100 last:border-0">
                                <td className="px-5 py-2">{s.nama}</td>
                                <td className="px-5 py-2">
                                    <span className={s.status === 'hadir' ? 'text-green-600 font-medium capitalize' : 'text-gray-400'}>
                                        {s.status === 'hadir' ? 'Hadir' : 'Belum'}
                                    </span>
                                </td>
                                <td className="px-5 py-2">{s.waktu ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirm(false)} />
                    <div className="relative bg-white rounded-xl border border-gray-200 shadow-xl max-w-sm w-full p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
                                    <AlertTriangle size={18} />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900">Tutup Sesi Absensi?</h3>
                            </div>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-1">
                            Sesi <strong>{session.kelas}</strong> — <strong>{session.mata_pelajaran}</strong> akan ditutup.
                        </p>
                        <p className="text-sm text-gray-500 mb-5">
                            Siswa tidak akan bisa scan QR lagi setelah sesi ditutup.
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="h-9 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleTutupAbsensi}
                                disabled={isClosing}
                                className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isClosing && <Loader2 size={16} className="animate-spin" />}
                                <span>{isClosing ? 'Menutup...' : 'Ya, Tutup'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}