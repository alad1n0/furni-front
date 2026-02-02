'use client'

import {cn} from "@/helpers/cn";
import {ComponentProps, FC} from "react";

interface IToggleBtnProps extends ComponentProps<'button'> {
    useStateProps: [value: boolean, () => void];
}

export const ToggleBtn: FC<IToggleBtnProps> = ({useStateProps, children, className, ...props}) => {
    const [value, setValue] = useStateProps
    return (
        <button
            className={cn(
                'bg-react/500 hover:bg-react/500/40 text-react/300 min-w-[40px] w-fit min-h-[40px] py-1 px-4 rounded-[12px] font-semibold transition-all duration-300 ease-out flex gap-[10px] items-center text-start',
                className,
            )}
            onClick={setValue}
            {...props}
        >
            <div className={cn('border-2 border-red/500 size-[20px] rounded-[5px] flex items-center justify-center shrink-0 duration-300', value && 'border-emerald/500')}>
                <div className={cn('bg-emerald/500 rounded-[2px] size-[12px] duration-300', !value && 'opacity-0')}>
                </div>
            </div>
            {children}
        </button>
    )
}