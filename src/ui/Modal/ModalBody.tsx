import { ComponentProps, FC } from "react";
import {cn} from "@/helpers/cn";

type ModalBodyProps = ComponentProps<"div">

const ModalBody: FC<ModalBodyProps> = ({ children, className, ...props }) => {
    return (
        <div
            {...props}
            className={cn(
                "flex flex-col",
                className
            )}
        >
            {children}
        </div>
    );
};

export default ModalBody;