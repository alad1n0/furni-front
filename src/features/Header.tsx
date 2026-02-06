import { FC } from 'react';
import { Menu } from "@mui/icons-material";
import useModal from '@/hooks/useModal';

interface HeaderProps {
    onMenuToggle: () => void;
}

export const Header: FC<HeaderProps> = ({ onMenuToggle }) => {
    // const { data: userInfo } = useUserInfo();
    // const modalUserInfo = useModal()

    return (
        <>
            <header className="fixed top-0 left-0 right-0 h-16 bg-react/500 z-[60] desktop:left-[160px]">
                <div className="h-full px-4 flex items-center justify-between">
                    {/*<button*/}
                    {/*    onClick={onMenuToggle}*/}
                    {/*    className="desktop:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"*/}
                    {/*>*/}
                    {/*    <Menu sx={{ fontSize: 28, color: '#374151' }} />*/}
                    {/*</button>*/}

                    {/*<div className="hidden desktop:block"></div>*/}

                    {/*<div className="flex items-center gap-4">*/}
                    {/*    {userInfo?.id && <NotificationCenter userId={userInfo.id} />}*/}

                    {/*    <button*/}
                    {/*        onClick={() => modalUserInfo.onOpen()}*/}
                    {/*        className="w-8 h-8 rounded-[5px] bg-react/400"*/}
                    {/*    >*/}
                    {/*        👤*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                </div>
            </header>

            {/*<UserInfoModal*/}
            {/*    {...modalUserInfo}*/}
            {/*    userInfo={userInfo}*/}
            {/*    onClose={() => {*/}
            {/*        modalUserInfo.onClose();*/}
            {/*    }}*/}
            {/*/>*/}
        </>
    );
};