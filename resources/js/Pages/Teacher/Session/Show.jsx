import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../../Lib/axios';

export default function SessionShow() {
    const { id } = useParams();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            const response = await api.get(`/teacher/sessions/${id}`);
            setSession(response.data.data);
            setLoading(false);
        };

        fetchSession();
    }, [id]);

    if (loading) {
        return <p className="text-gray-500">Memuat data...</p>;
    }

    return (
        <div className="max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Absensi {session.kelas}
            </h1>
            <p className="text-gray-500 mb-6">{session.mata_pelajaran}</p>

            <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <QRCodeSVG value={session.qr_token} size={220} />
                </div>

                <p className="mt-4 text-sm text-gray-500">
                    Sesi: <span className={session.status === 'active' ? 'text-green-600 font-medium' : 'text-gray-400 font-medium'}>
                        {session.status === 'active' ? 'Aktif' : 'Ditutup'}
                    </span>
                </p>
                <p className="text-sm text-gray-500">
                    Waktu: {session.waktu_mulai} - {session.waktu_selesai}
                </p>
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
                Daftar siswa yang sudah hadir dan tombol tutup absensi akan ditambahkan di Tahap 20.
            </p>
        </div>
    );
}