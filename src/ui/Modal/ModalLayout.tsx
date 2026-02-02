import {CSSProperties, FC, PropsWithChildren} from "react";
import {cn} from "@/helpers/cn";
import {ModalProps} from "@/hooks/useModal/useModal";
import Portal from "@/common/Portal";

interface ModalLayoutProps extends PropsWithChildren<ModalProps> {
    className?: string
    style?: CSSProperties
}

const ModalLayout: FC<ModalLayoutProps> = (
    {
        onClose,
        open,
        animation,
        children,
        className,
        style
    }) => {
    if (!open) return null;

    return (
        <Portal target="modals-root">
            <div
                style={{...(style || {})}}
                onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                }}
                className={cn(
                    "h-dvh overscroll-none z-[70] top-0 left-0 w-full bg-react/500 bg-opacity-80 duration-0 flex justify-center items-center fixed", // backdrop-blur-[1.7px]
                    animation === "out" ? `animate-fade-out` : "animate-fade-in"
                )}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={cn('bg-react/400 w-full h-full p-5 shadow-xl min-h-[200px] text-gray/200 overflow-y-auto max-h-dvh', className)}
                >
                    {children}
                </div>
            </div>
        </Portal>
    );
};


export default ModalLayout;