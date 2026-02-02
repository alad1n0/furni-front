import {PropsWithChildren, FC} from 'react';
import NavigationMenu from "../features/navigationMenu/NavigationMenu";
import {useAuthStore} from "../store/auth/authReducer";

const BurgerMenu: FC<PropsWithChildren> = ({children}) => {
    const {accessToken} = useAuthStore()

    return (
        <div className={'flex-1 flex flex-col desktop:flex-row'}>
            {accessToken && <NavigationMenu/>}
            <div className={'flex-1 '}>{children}</div>
        </div>
    );
}

export default BurgerMenu