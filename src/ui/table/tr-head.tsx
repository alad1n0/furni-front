import {ComponentProps, FC} from "react";
import {cn} from "../../helpers/cn";

type ITHeadProps = ComponentProps<'tr'>

export  const TrHead: FC<ITHeadProps> = ({className, ...rest}) => {
    return (
        <tr
            className={cn("[&>th]:border [&>th]:border-react/400 [&>th]:px-4 [&>th]:py-2 [&>th]:text-left [&>th]:text-nowrap", className)}
            {...rest}
        >

        </tr>
    );
};