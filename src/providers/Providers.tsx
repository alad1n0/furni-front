import {FC, PropsWithChildren} from "react";
import ToastifyProvider from "@/providers/ToastifyProvider";
import ReactQueryProvider from "./ReactQueryProvider";
import HeaderProvider from "./HeaderProvider";
import MuiProvider from "./MuiProvider";

const Providers: FC<PropsWithChildren> = ({children}) => {
    return (
        <ToastifyProvider>
            <MuiProvider>
                <ReactQueryProvider>
                    <HeaderProvider>
                        {children}
                    </HeaderProvider>
                </ReactQueryProvider>
            </MuiProvider>
        </ToastifyProvider>
    );
};

export default Providers;