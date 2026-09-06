import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const SCANNER_ELEMENT_ID = 'qr-reader';

export default function Scan() {
    const scannerRef = useRef(null);
    const [scannedToken, setScannedToken] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = scanner;

        scanner
            .start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    setScannedToken(decodedText);
                    scanner.stop().catch(() => {});
                },
                () => {
                    // Diabaikan: dipanggil terus-menerus setiap frame kamera
                    // yang belum berhasil mendeteksi QR Code apa pun.
                }
            )
            .catch(() => {
                setError('Tidak bisa mengakses kamera. Pastikan kamu memberikan izin kamera di browser.');
            });

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
            }
        };
    }, []);

    const handleScanUlang = () => {
        setScannedToken(null);
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Scan QR Absensi</h1>

            {error && (
                <p className="text-sm text-red-600 mb-4 text-center max-w-xs">{error}</p>
            )}

            {!scannedToken && (
                <div id={SCANNER_ELEMENT_ID} className="w-full max-w-xs rounded-xl overflow-hidden border border-gray-200" />
            )}

            {scannedToken && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 w-full max-w-xs text-center">
                    <p className="text-green-600 font-semibold mb-2">QR Code terdeteksi</p>
                    <p className="text-xs text-gray-500 break-all mb-4">{scannedToken}</p>
                    <p className="text-xs text-gray-400 mb-4">
                        Proses pengiriman absensi akan ditambahkan di Tahap 20.
                    </p>
                    <button
                        onClick={handleScanUlang}
                        className="text-sm text-blue-600 font-medium hover:underline"
                    >
                        Scan Ulang
                    </button>
                </div>
            )}
        </div>
    );
}