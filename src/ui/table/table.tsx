import {ComponentProps, FC} from "react";
import {cn} from "@/helpers/cn";

type ITableProps = ComponentProps<'table'>

export const Table:FC<ITableProps> = ({className, children, ...rest}) => {
    return (
        <table className={cn("table-auto w-full border-collapse border bg-react/500 rounded-[14px] overflow-hidden", className)} {...rest}>
            {children}
        </table>
    );
};