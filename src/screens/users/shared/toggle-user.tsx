import { cn } from "@/helpers/cn";
import { useMainUserFilterStore } from "@/store/user/useMainUserFilterStore";

const ToggleUser = () => {
    const { isToggle, setIsToggle } = useMainUserFilterStore();

    const options = [
        { key: "users", label: "Users" },
        { key: "user-roles", label: "User roles" },
    ] as const;

    const getTranslateX = () => {
        const index = options.findIndex(o => o.key === isToggle);
        return index * 100;
    }

    return (
        <div className={cn("flex items-center rounded-[12px] shrink-0 bg-react/500 p-[4px]")}>
            <div className="relative w-full">
                <div className="grid grid-cols-2 relative z-10 text-base tablet:text-lg font-medium text-white">
                    {options.map((opt) => (
                        <button
                            key={opt.key}
                            className={cn(
                                "px-3 py-[6px] transition-colors duration-300 rounded-[10px]",
                                isToggle === opt.key ? "text-white/600" : "text-white/80"
                            )}
                            onClick={() => setIsToggle(opt.key)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <div
                    className="absolute top-0 left-0 h-full w-1/2 bg-[#E74C3C] rounded-[10px] transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(${getTranslateX()}%)` }}
                />
            </div>
        </div>
    );
};

export default ToggleUser;