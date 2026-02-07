import {useMainOrderFilterStore} from "@/store/order/useMainOrderFilterStore";
import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import {cn} from "@/helpers/cn";
import Order from "@/screens/order/features/screens/order-screen/Order";
import OrderStatus from "@/screens/order/features/screens/order-status-screen/OrderStatus";

const OrderScreens  = () => {
    const { isToggle } = useMainOrderFilterStore();

    return (
        <>
            <MainLayout className={cn("item-center", isToggle !== "order" && "hidden")}>
                <Order />
            </MainLayout>

            <MainLayout className={cn("item-center", isToggle !== "order-status" && "hidden")}>
                <OrderStatus />
            </MainLayout>
        </>
    )
}

export default OrderScreens;