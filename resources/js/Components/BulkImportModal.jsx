import { useState } from 'react';
import { Download, Upload, X, CheckCircle } from 'lucide-react';
import api from '../Lib/axios';

const NAVY = '#1E3A5F';

export default function BulkImportModal({
    isOpen,
    onClose,
    title,
    columns = [],
    templateUrl,
    importUrl,
    templateFilename = 'template-import.xlsx',
    onImported,
}) {
    if (!isOpen) return null;

    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [imported, setImported] = useState(0);
    const [errors, setErrors] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');

    const handleTemplate = async () => {
        try {
            const response = await api.get(templateUrl, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', templateFilename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Gagal mengunduh template.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setSuccessMsg('');
        setImported(0);

        if (!file) {
            setErrors([{ row: '-', errors: ['Pilih file terlebih dahulu.'] }]);
            return;
        }

        setSubmitting(true);

        const form = new FormData();
        form.append('file', file);

        try {
            const response = await api.post(importUrl, form);
            setImported(response.data.imported || 0);
            setSuccessMsg(response.data.message || 'Data berhasil diimpor.');
            setErrors([]);
            onImported && onImported(response.data);
        } catch (err) {
            if (err.response?.status === 422 && err.response.data) {
                setImported(err.response.data.imported || 0);
                setSuccessMsg(err.response.data.message || 'Import selesai dengan beberapa kesalahan.');
                setErrors(err.response.data.errors || []);
                onImported && onImported(err.response.data);
            } else {
                setSuccessMsg('');
                setErrors([
                    { row: '-', errors: [err.response?.data?.message || err.message || 'Gagal mengimpor data.'] },
                ]);
            }
        } finally {
            setFile(null);
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setImported(0);
        setErrors([]);
        setSuccessMsg('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl w-full max-w-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
                    <h2 className="text-base font-semibold text-[#1F2937]">{title}</h2>
                    <button
                        onClick={handleClose}
                        type="button"
                        className="text-[#9CA3AF] hover:text-[#1F2937]"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <p className="text-sm text-[#6B7280]">
                        Unggah file Excel (.xlsx/.xls) atau CSV yang berisi kolom sesuai template.
                        Baris dengan kesalahan tidak akan diimpor, namun baris valid tetap akan tersimpan.
                    </p>

                    {columns.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px] text-[#6B7280] border border-[#E5E7EB] rounded-lg overflow-hidden">
                                <thead className="bg-[#F5F7FA] text-[10px] uppercase tracking-wide text-[#6B7280]">
                                    <tr>
                                        {columns.map((c) => (
                                            <th key={c.label} className="py-1.5 px-2 font-semibold">
                                                {c.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t border-[#E5E7EB]">
                                        {columns.map((c) => (
                                            <td key={c.label} className="py-1.5 px-2 text-[#1F2937]">
                                                {c.example}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                            <label
                                htmlFor="bulk-import-file"
                                className="flex items-center justify-center w-full h-10 px-3 text-sm text-[#1F2937] bg-white border border-[#E5E7EB] rounded-lg cursor-pointer hover:bg-[#F5F7FA] transition-colors"
                            >
                                <Upload size={16} className="mr-2 text-[#6B7280]" />
                                <span>{file ? file.name : 'Pilih file'}</span>
                                <input
                                    id="bulk-import-file"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    className="hidden"
                                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                />
                            </label>
                        </div>

                        {successMsg && (
                            <div className="flex items-start gap-2 text-sm">
                                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle size={12} className="text-white" />
                                </div>
                                <div className="text-emerald-700">
                                    {successMsg}
                                    {imported > 0 && <span className="block text-[#6B7280]">Berhasil diimpor: {imported} baris.</span>}
                                </div>
                            </div>
                        )}

                        {errors.length > 0 && (
                            <div className="space-y-2 max-h-56 overflow-y-auto">
                                <div className="flex items-center gap-1.5 text-sm font-medium text-red-700">
                                    <X size={14} />
                                    <span>{errors.length} baris tidak dapat diimpor:</span>
                                </div>
                                <ul className="space-y-1 text-xs text-[#6B7280]">
                                    {errors.map((f, i) => (
                                        <li key={i} className="bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
                                            <span className="font-medium text-red-800">Baris {f.row}:</span>{' '}
                                            {Array.isArray(f.errors) ? f.errors.join('; ') : f.errors}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={handleTemplate}
                                className="h-9 px-3 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F5F7FA] text-[#6B7280] text-sm font-medium flex items-center gap-1.5 transition-colors"
                            >
                                <Download size={14} />
                                <span>Unduh Template</span>
                            </button>

                            <button
                                type="submit"
                                disabled={submitting || !file}
                                className="h-9 px-4 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-60"
                                style={{ background: NAVY, opacity: submitting || !file ? 0.6 : 1 }}
                                onMouseEnter={(e) => { if (!submitting && file) e.currentTarget.style.background = '#16304F'; }}
                                onMouseLeave={(e) => { if (!submitting && file) e.currentTarget.style.background = NAVY; }}
                            >
                                <Upload size={14} />
                                <span>{submitting ? 'Mengimpor...' : 'Import Data'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
