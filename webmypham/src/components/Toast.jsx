import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast({
    message,
    type = 'info',
    duration = 3000,
    onClose,
}) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor =
        type === 'success'
            ? 'bg-green-500'
            : type === 'error'
            ? 'bg-red-500'
            : type === 'warning'
            ? 'bg-yellow-500'
            : 'bg-blue-500';

    const Icon =
        type === 'success'
            ? CheckCircle
            : type === 'error'
            ? AlertCircle
            : Info;

    return (
        <div
            className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center z-50 min-w-[300px]`}>
            <Icon className="mr-2" size={20} />
            <span className="flex-1">{message}</span>
            <button
                onClick={onClose}
                className="ml-3 text-white hover:text-gray-200">
                <X size={18} />
            </button>
        </div>
    );
}
