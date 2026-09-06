import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-600">
                Sistem Absensi Siswa Berbasis QR Code
            </h1>
            <p className="mt-2 text-gray-600">
                React berhasil terhubung dengan Laravel 🎉
            </p>
        </div>
    );
}

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);