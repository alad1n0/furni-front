import {TrashSvg} from "../../assets";
import Button from "./Button";
import {FC, useState} from "react";
import {cn} from "@/helpers/cn";
import ConfirmActionModal from "../../features/confirm-modal";
import useModal from "../../hooks/useModal";

interface IButtonDelProps {
    onClick: () => Promise<void>
    className?: string
    confirm?: boolean
}

const ButtonDel: FC<IButtonDelProps> = ({className, onClick, confirm = true}) => {
    const modalDelete = useModal()
    const [isPending, setIsPending] = useState<boolean>(false)

    const onClickHandler = async () => {
        setIsPending(true)
        await onClick().finally(setIsPending.bind(null, false))
    }

    return (
        <>
            <Button
                className={cn('w-fit m-0', className)}
                onClick={() => {
                    if (confirm) {
                        modalDelete.onOpen()
                    } else {
                        onClickHandler()
                    }
                }}
                isDisable={isPending}
            >
                <div className={'w-4 h-4'}>
                    <img src={TrashSvg} alt={'refresh'}/>
                </div>
            </Button>
            {confirm && (
                <ConfirmActionModal onClick={onClickHandler} isPending={isPending} {...modalDelete} />
            )}
        </>
    )
}

export default ButtonDel;