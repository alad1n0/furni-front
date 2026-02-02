import {ComponentProps, FC} from "react";
import {cn} from "@/helpers/cn";
import {useAuthStore} from "@/store/auth/authReducer";

type IChildSubContainerAuth = ComponentProps<'div'>

const MainLayout: FC<IChildSubContainerAuth> = ({children, className}) => {
  const {accessToken} = useAuthStore()
  return (
    <div className={cn(
        'w-full max-w-[1700px] mt-16 p-3 flex flex-col overflow-y-scroll min-h-mobile tablet:min-h-tablet desktop:min-h-desktop desktop:max-w-[calc(100vw-160px)] gap-[12px]',
        !accessToken && 'max-w-none desktop:max-w-none min-h-[100dvh] tablet:min-h-[100dvh] desktop:min-h-[100dvh]',
        className
    )}>
      {children}
    </div>
  )
}

export default MainLayout