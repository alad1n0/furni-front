import React, {ComponentProps, FC} from 'react';
import {cn} from "@/helpers/cn";

const Title: FC<ComponentProps<'h1'>> = ({children, className, ...rest}) => {
    return <h1
        {...rest}
        className={cn(
            'text-[22px] tablet:text-[32px] font-semibold text-center mt-5 tablet:mt-8 desktop:mt-16',
            className,
        )}
    >
        {children}
    </h1>
};

export default Title;