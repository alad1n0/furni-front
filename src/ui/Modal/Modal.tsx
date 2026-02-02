import {CSSProperties, FC, PropsWithChildren} from "react";
import ModalLayout from "./ModalLayout";
import ModalTitle from "./ModalTitle";
import ModalBody from "./ModalBody";
import ModalFooter from "./ModalFooter";
import {ModalProps} from "@/hooks/useModal/useModal";

interface ModalComponentProps extends PropsWithChildren<ModalProps> {
    className?: string
    style?: CSSProperties
}

const ModalComponent: FC<ModalComponentProps> = (
    {
        children,
        ...layoutProps
    }) => {
    return <ModalLayout {...layoutProps}>{children}</ModalLayout>;
};

const Modal = Object.assign(ModalComponent, {
    Title: ModalTitle,
    Body: ModalBody,
    Footer: ModalFooter,
});

export default Modal;