import {ComponentProps, FC} from "react";

const PlusSvg: FC<ComponentProps<'svg'>> = ({...rest}) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff" {...rest}>
            <path d="M444-444H240v-72h204v-204h72v204h204v72H516v204h-72v-204Z"/>
        </svg>
    );
};

export default PlusSvg;