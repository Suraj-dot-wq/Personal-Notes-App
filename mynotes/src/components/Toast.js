import React, {
    createContext,
    useContext,
    useState,
    useCallback
} from 'react';

const ToastContext = createContext();

export const useToast = () => {
    return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random();

        setToasts((current) => [
            ...current,
            {
                id,
                message,
                type
            }
        ]);

        setTimeout(() => {
            setToasts((current) =>
                current.filter((toast) => toast.id !== id)
            );
        }, 3500);
    }, []);

    const removeToast = (id) => {
        setToasts((current) =>
            current.filter((toast) => toast.id !== id)
        );
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div className="toast-container">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast toast-${toast.type}`}
                    >
                        <div className="toast-icon">
                            {toast.type === 'success' && '✓'}
                            {toast.type === 'error' && '×'}
                            {toast.type === 'info' && 'i'}
                        </div>

                        <span>{toast.message}</span>

                        <button
                            className="toast-close"
                            onClick={() => removeToast(toast.id)}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};