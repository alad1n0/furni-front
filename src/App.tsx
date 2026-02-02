import '@/App.css'
import {Route, RouteObject, Routes} from "react-router";
import Auth from "@/screens/auth/Auth";
import Providers from "@/providers/Providers";
import {useAuthStore} from "./store/auth/authReducer";
import Version from "@/screens/version/Version";
import {RouterEnum} from "./config/RouterEnum";
import '@mui/x-date-pickers/timeViewRenderers';
import Users from "@/screens/users/Users";

function App() {
    const {accessToken} = useAuthStore()
    const routes: Array<RouteObject> = [
        // { path: RouterEnum.MAIN, element: <Main /> },
        { path: RouterEnum.USERS, element: <Users /> },
        { path: RouterEnum.VERSION, element: <Version /> },
    ]

    return (
        <Providers>
            <div className={'text-gray/300'}>
                <Routes>
                    {accessToken
                        ? routes.map((route, index) => (
                            <Route key={index} path={route.path} element={route.element}/>
                        ))
                        : <Route path="*" element={<Auth/>}/>
                    }
                </Routes>
            </div>
        </Providers>
    )
}

export default App
