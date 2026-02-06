import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import UserRoles from "@/screens/users/features/screens/user-role-screen/UserRoles";
import Users from "@/screens/users/features/screens/user-screen/Users";
import {useMainUserFilterStore} from "@/store/user/useMainUserFilterStore";
import {cn} from "@/helpers/cn";

const UserScreens = () => {
    const { isToggle } = useMainUserFilterStore();

    return (
        <>
            <MainLayout className={cn("items-center", isToggle !== "users" && "hidden")}>
                <Users />
            </MainLayout>

            <MainLayout className={cn("items-center", isToggle !== "user-roles" && "hidden")}>
                <UserRoles />
            </MainLayout>
        </>
    )
}

export default UserScreens;
