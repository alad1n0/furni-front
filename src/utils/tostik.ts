import toast from "react-hot-toast";

export const tostik = {
    success: (message: string) => {
        toast(message, {
            style: {
                borderRadius: '10px',
                background: '#0C5132',
                color: '#fff',
            },
        });
    },
    error: (message: string) => {
        toast(message, {
            style: {
                borderRadius: '10px',
                background: '#E43F3F',
                color: '#fff',
            },
        });
    },
    info: (message: string) => {
        toast(message, {
            style: {
                borderRadius: '10px',
                background: '#007bff',
                color: '#fff',
            },
        });
    },
}