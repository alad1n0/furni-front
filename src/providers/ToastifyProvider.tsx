import {FC, PropsWithChildren} from "react";
import {Toaster} from "react-hot-toast";

const ToastifyProvider: FC<PropsWithChildren> = ({children}) => {
    return (
        <>
            {/*<Toaster*/}
            {/*    position="top-right"*/}
            {/*    expand={false}*/}
            {/*    richColors*/}
            {/*    duration={5000}*/}
            {/*    theme={'dark'}*/}
            {/*/>*/}
            <Toaster toastOptions={
                {
                    success: {
                        style: {
                            borderRadius: '10px',
                            background: '#2ecc71',
                            color: '#fff',
                        },
                    },
                    error: {
                        style: {
                            borderRadius: '10px',
                            background: '#ff1616',
                            color: '#fff',
                        },
                    },
                    loading: {
                        style: {
                            borderRadius: '10px',
                            background: '#f0ad4e',
                            color: '#fff',
                        },
                    }
                }}
                     position={'top-right'}
            />
            {children}
        </>
    );
};

export default ToastifyProvider;