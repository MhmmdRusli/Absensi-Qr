export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
                    <h2 className="font-semibold text-[#1F2937]">{title}</h2>
                    <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#4B5563] text-xl leading-none">
                        &times;
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}