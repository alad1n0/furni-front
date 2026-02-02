import CheckSvg from "../../assets/check-svg";
import Button from "./Button";
import {FC, ReactNode} from "react";
import {cn} from "../../helpers/cn";

interface IButtonProps {
    isPending?: boolean
    onClick: () => void
    className?: string
    Icon?: ReactNode
}

export const ButtonSubmit: FC<IButtonProps> = ({isPending, className, onClick, Icon = <CheckSvg/>}) => {
    return (
        <Button
            classNameText={'p-0'}
            className={cn('m-0 py-0 px-2 w-[40px] h-[36px] min-h-[36px]', className)}
            color={'greenDarkgreen'}
            onClick={onClick}
            isPending={isPending}
        >
            {Icon}
        </Button>
    )
}