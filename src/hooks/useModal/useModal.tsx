import {Dispatch, SetStateAction, useEffect, useState} from "react";

type modalAnimation = 'in' | 'out';

export interface ModalProps {
    open: boolean
    onOpen: (value?: object | number | string) => void
    onClose: () => void
    animation: modalAnimation
    stateModal: string | number | object
    successMessage: string | null
    setSuccessMessage: Dispatch<SetStateAction<string | null>>
    isUpdate: number
}

const useModal = (isScroll: boolean = false): ModalProps => {
    const [open, setIsOpen] = useState(false);
    const [animation, setAnimation] = useState<modalAnimation>('in');
    const [stateModal, setStateModal] = useState<string | number | object>('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isUpdate, setIsUpdate] = useState<number>(0);

    useEffect(() => {
        if (!isScroll)
            document.body.style.overflow = open ? "hidden" : "auto";
    }, [open, isScroll]);

    const handleOpenModal = (value: string | number | object = '') => {
        setAnimation("in");
        setIsOpen(true)
        setStateModal(value)
        setSuccessMessage(null)
        setIsUpdate(prev => prev + 1)
    };

    const handleCloseModal = () => {
        setAnimation("out");
        setTimeout(() => setIsOpen(false), 200);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleCloseModal();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return {
        open,
        onOpen: handleOpenModal,
        onClose: handleCloseModal,
        animation,
        stateModal,
        successMessage,
        setSuccessMessage,
        isUpdate,
    };
};

export default useModal;