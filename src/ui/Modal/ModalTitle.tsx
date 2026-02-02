import {ComponentProps, FC} from "react";
import {cn} from "@/helpers/cn";
import { XModalIconSvg } from "@/assets";

interface ModalTitleProps extends ComponentProps<"div"> {
    onClose?: () => void
}

const ModalTitle: FC<ModalTitleProps> = ({children, className, onClose, ...props}) => {
    return (
        <div
            {...props}
            className={cn(
                "flex flex-row flex-nowrap justify-between font-medium items-start text-lg gap-5",
                className
            )}
        >
            <div>{children}</div>
            {onClose &&
                <button
                    onClick={onClose}
                    className={'w-[38px] h-[38px] flex items-center justify-center rounded-full hover:bg-react/500 active:bg-gray/400 cursor-pointer duration-300 shrink-0'}
                    type={'reset'}
                >
                    <img src={XModalIconSvg} alt={'x'}/>
                </button>
            }
        </div>
    );
};

export default ModalTitle;