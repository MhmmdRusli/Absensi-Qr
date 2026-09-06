export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
                        &times;
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}