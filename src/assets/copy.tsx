import {ComponentProps, FC} from "react";

const CopySvg:FC<ComponentProps<'svg'>> = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#D1D1D1" {...props}>
            <path
                d="M360-240q-29.7 0-50.85-21.15Q288-282.3 288-312v-480q0-29.7 21.15-50.85Q330.3-864 360-864h384q29.7 0 50.85 21.15Q816-821.7 816-792v480q0 29.7-21.15 50.85Q773.7-240 744-240H360Zm0-72h384v-480H360v480ZM216-96q-29.7 0-50.85-21.15Q144-138.3 144-168v-516q0-15.3 10.29-25.65Q164.58-720 179.79-720t25.71 10.35Q216-699.3 216-684v516h420q15.3 0 25.65 10.29Q672-147.42 672-132.21t-10.35 25.71Q651.3-96 636-96H216Zm144-216v-480 480Z"/>
        </svg>
    );
};

export default CopySvg;