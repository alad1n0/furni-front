import {ComponentProps, FC} from "react";
import {LoadingIconSvg} from "@/assets";
import {cn} from "../../helpers/cn";

const Loading: FC<Omit<ComponentProps<'img'>, 'src' | 'alt'>> = ({className, ...rest}) => {
    return <img src={LoadingIconSvg} {...rest} className={cn('mx-auto rounded-full animate-spin', className)} alt={'loader'}/>
};

export default Loading;