import { Table } from "@/ui/table/table";
import { TrHead } from "@/ui/table/tr-head";
import { TrBody } from "@/ui/table/tr-body";
import { cn } from "@/helpers/cn";
import { refreshIcon } from "@/assets";
import {useConstructionStatus} from "@/screens/construction/hooks/construction-status/useConstructionStatus";
import ToggleConstruction from "@/screens/construction/shared/toggle-construction";

const ConstructionStatus = () => {
    const { data: dataConstructionStatus, isPending: isPendingConstructionStatus } = useConstructionStatus();

    return (
        <>
            <div className={"flex flex-col gap-3 w-full"}>
                <div className={"flex gap-4 justify-between items-end"}>
                    <div className={"flex items-center flex-row gap-4"}>
                        <ToggleConstruction />
                    </div>
                </div>

                <div className="flex items-center flex-col justify-center gap-5 overflow-hidden">
                    <div className={"overflow-x-auto w-full"}>
                        <Table>
                            <thead>
                            <TrHead>
                                <th>code</th>
                                <th>title</th>
                            </TrHead>
                            </thead>
                            <tbody>
                            {dataConstructionStatus?.map((item) => (
                                <TrBody key={item.id}>
                                    <td>{item.code}</td>
                                    <td>{item.title}</td>
                                </TrBody>
                            ))}
                            {isPendingConstructionStatus && (
                                <TrBody>
                                    <td colSpan={5}>
                                        <div
                                            className={cn(
                                                "w-full h-6 animate-spin flex justify-center"
                                            )}
                                        >
                                            <img
                                                src={refreshIcon}
                                                alt={"refresh"}
                                            />
                                        </div>
                                    </td>
                                </TrBody>
                            )}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConstructionStatus;