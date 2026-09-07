import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../Lib/axios';

const SCANNER_ELEMENT_ID = 'qr-reader';

export default function Scan() {
    const scannerRef = useRef(null);
    const [status, setStatus] = useState('scanning'); // scanning | loading | success | error
    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (status !== 'scanning') {
            return;
        }

        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = scanner;
        let hasStopped = false;

        const safeStop = async () => {
            if (hasStopped) {
                return;
            }
            hasStopped = true;
            try {
                await scanner.stop();
            } catch (err) {
                // Kamera memang sudah berhenti/belum sempat jalan, aman diabaikan.
            }
        };

        scanner
            .start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    safeStop().then(() => submitScan(decodedText));
                },
                () => {}
            )
            .catch(() => {
                setStatus('error');
                setErrorMessage('Tidak bisa mengakses kamera. Pastikan kamu memberikan izin kamera di browser.');
            });

        return () => {
            safeStop();
        };
    }, [status]);

    const submitScan = async (token) => {
        setStatus('loading');

        try {
            const response = await api.post('/student/attendance/scan', { token });
            setResult(response.data.data);
            setStatus('success');
        } catch (err) {
            setErrorMessage(err.response?.data?.message ?? 'Terjadi kesalahan. Coba lagi.');
            setStatus('error');
        }
    };

    const handleScanUlang = () => {
        setResult(null);
        setErrorMessage('');
        setStatus('scanning');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Scan QR Absensi</h1>

            {status === 'scanning' && (
                <div id={SCANNER_ELEMENT_ID} className="w-full max-w-xs rounded-xl overflow-hidden border border-gray-200" />
            )}

            {status === 'loading' && (
                <p className="text-sm text-gray-500">Memproses absensi...</p>
            )}

            {status === 'success' && result && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-xs text-center">
                    <p className="text-green-600 font-bold text-lg mb-4">✓ Absensi Berhasil</p>
                    <div className="text-sm text-left space-y-1 text-gray-700">
                        <p><span className="text-gray-500">Nama</span> : {result.nama}</p>
                        <p><span className="text-gray-500">Kelas</span> : {result.kelas}</p>
                        <p><span className="text-gray-500">Mata Pelajaran</span> : {result.mata_pelajaran}</p>
                        <p><span className="text-gray-500">Status</span> : <span className="capitalize">{result.status}</span></p>
                        <p><span className="text-gray-500">Waktu</span> : {result.waktu}</p>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-xs text-center">
                    <p className="text-red-600 font-medium mb-4">{errorMessage}</p>
                    <button
                        onClick={handleScanUlang}
                        className="text-sm text-blue-600 font-medium hover:underline"
                    >
                        Coba Lagi
                    </button>
                </div>
            )}
        </div>
    );
}