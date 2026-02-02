import {ComponentProps, FC} from "react";
import {cn} from "@/helpers/cn";
import Loading from "../loading/Loading";
import {Link} from "react-router";

interface IButtonProps extends ComponentProps<'button'> {
    color?: keyof typeof buttonStyles
    isPending?: boolean
    isDisable?: boolean
    ImgLeftIcon?: string
    ImgRightIcon?: string
    loadingText?: number
    disablePropagation?: boolean
    classNameText?: string
    nowrap?: boolean
}

const buttonStyles = {
    greenWhite: 'bg-green-primary/600 text-black/600 hover:bg-white/600 active:bg-white/600',
    grayGreen: 'bg-gray/100 text-black/600 min-h-[42px] hover:bg-green-primary/50 hover:text-green-dark/600 active:bg-green-primary/50 active:text-green-dark/600',
    greenDarkgreen: 'bg-emerald/500 text-black/600 hover:bg-emerald/600 active:bg-emerald/600 text-white/600',
    transparent: 'text-black/600 hover:underline active:underline',
    blackGreenLine: 'bg-white/600 text-black/600 border border-black/600 hover:border-green-secondary/600 active:border-green-secondary/600 py-[14px] hover:text-green-secondary/600 active:text-green-secondary/600',
    grayWhite: 'bg-gray/200 text-black/600 hover:bg-white/600 active:bg-white/600',
    blackNoneLine: 'bg-white/600 border border-white/600 hover:border-black/600 active:border-black/600',
    greenLightLineWhiteBlackLine: 'bg-green-primary/50 border border-green-primary/600 text-green-dark/600 hover:text-black/600 hover:bg-gray/100 hover:border-black/600 active:border-black/600 fill-green-dark/600 hover:fill-black/600',
    lightGrayWhite: 'bg-gray/100 border border-gray/100 text-gray/400 hover:text-black/600 active:border-black/600 fill-gray/400 hover:fill-black/600',
    whiteSalat: 'px-4 bg-white/600 text-black/500 font-semibold hover:bg-green-primary/50 hover:text-green-dark/600 rounded-full',
    WhiteBlackLineAndWhite: 'bg-white/600 border border-black/600 text-black/600 hover:text-black/400 hover:border-black/400 active:border-black/400 fill-black/600 hover:fill-black/400',
    redAndGray: 'bg-red/500 text-white/600 hover:bg-white/600 hover:bg-opacity-5 active:bg-opacity-5 active:bg-white/600',
    red: 'bg-red/500 text-white/600 hover:bg-opacity-80 active:bg-opacity-5 active:bg-white/600',
    gray: 'bg-react/500 text-white/600 hover:bg-white/600 hover:bg-opacity-5 active:bg-opacity-5 active:bg-white/600',
    blue: 'bg-blue/600 hover:bg-opacity-80 text-white/600 fill-white/600',

};

const Button: FC<IButtonProps> = (
    {
        color = 'redAndGray',
        children,
        isPending = false,
        isDisable = false,
        className,
        onClick,
        loadingText,
        disablePropagation = false,
        classNameText = '',
        nowrap = false,
        ...props
    }) => {
    return (
        <button
            {...props}
            className={cn(
                'bg-react/500 min-w-[40px]',
                'py-1 px-4 rounded-[12px] font-semibold mx-auto transition-all duration-500 ease-out',
                color !== 'grayGreen' && 'min-h-[40px]',
                buttonStyles[color],
                isPending ? 'w-[58px] text-opacity-0 pointer-events-none' : 'w-full',
                (isPending && (color === 'greenWhite' || color === 'greenDarkgreen')) && 'hover:bg-green-primary/600 active:bg-green-primary/600',
                (isPending && color === 'grayWhite') && 'hover:bg-gray/200 active:bg-gray/200',
                isDisable && 'opacity-50 pointer-events-none',
                className
            )}
            onClick={(e) => {
                if (!disablePropagation) e.stopPropagation()
                return isPending || isDisable ? {} : onClick && onClick(e)
            }}
        >
            {isPending
                ? (loadingText ? loadingText : <Loading />)
                : <div className={cn('flex justify-center items-center gap-2 duration-0 text-wrap p-1 shrink-0 [&>div]:shrink-0', nowrap && 'text-nowrap', classNameText)}>
                    {children} </div>
            }
        </button>
    );
};

export default Button;

export const LinkButton:FC<ComponentProps<typeof Link>> = ({children, className, ...rest}) => {
    return <Link
        className={cn(
            'py-2 px-4 rounded-[12px] duration-300 flex flex-row gap-2 font-semibold text-white/600 bg-react/500 text-center hover:bg-white/600 hover:bg-opacity-5',
            className,
        )}
        {...rest}
    >
        <div className={'text-center w-full'}>{children}</div>
    </Link>
}