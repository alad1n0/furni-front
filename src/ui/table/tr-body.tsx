import {ComponentProps, FC} from "react";
import {cn} from "@/helpers/cn";

type TBodyProps = ComponentProps<'tr'>

export const TrBody:FC<TBodyProps> = ({className, ...rest}) => {
    return (
        <tr
            className={cn('[&>td]:border [&>td]:border-react/400 [&>td]:px-4 [&>td]:py-[5px] [&>td]:max-w-[300px] [&>td]:text-nowrap [&>td]:overflow-x-scroll', className)}
            {...rest}
        >

        </tr>
    );
};