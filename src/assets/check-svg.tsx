import {ComponentProps, FC} from "react";

const CheckSvg:FC<ComponentProps<'svg'>> = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" height="24px" width="24px" fill="#fff" {...props}>
            <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
        </svg>
    );
};

export default CheckSvg