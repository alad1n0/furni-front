import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import {cn} from "@/helpers/cn";
import {useConstructionStore} from "@/store/construction/useConstructionStore";
import Construction from "@/screens/construction/pages/construction/Construction";
import ConstructionStatus from "@/screens/construction/pages/construction-status/ConstructionStatus";

const ConstructionsScreens  = () => {
    const { isToggle } = useConstructionStore();

    return (
        <>
            <MainLayout className={cn("item-center", isToggle !== "construction" && "hidden")}>
                <Construction />
            </MainLayout>

            <MainLayout className={cn("item-center", isToggle !== "construction-status" && "hidden")}>
                <ConstructionStatus />
            </MainLayout>
        </>
    )
}

export default ConstructionsScreens;