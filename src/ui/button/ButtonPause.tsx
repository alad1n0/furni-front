import Button from "./Button";
import {FC} from "react";
import {cn} from "../../helpers/cn";
import PauseSvg from "../../assets/pauseSvg";

interface IButtonProps {
    isPending?: boolean
    onClick: () => void
    className?: string
}

export const ButtonPause: FC<IButtonProps> = ({isPending, className, onClick}) => {
    return (
        <Button
            classNameText={'p-0'}
            className={cn('m-0 py-0 px-2 w-[40px] h-[36px] min-h-[36px]', className)}
            onClick={onClick}
            isPending={isPending}
        >
            <PauseSvg/>
        </Button>
    )
}