import React from "react";
import MainLayout from "@/ui/layouts/main-layout/MainLatout";
import Title from "@/ui/title/Title";
import {dataVersionInformation} from "./data/dataVersionInformation";
import VersionInformationCard from "./features/versionInformationCard/VersionInformationCard";

const Version = () => {
    return (
        <MainLayout className={'items-center'}>
            <Title className={'my-8'}>Traffmania version control</Title>
            <div className={'flex flex-col gap-5 max-w-[1060px]'}>
                {dataVersionInformation.map((item, index) =>
                    <VersionInformationCard key={index} {...item} />)
                }
            </div>
        </MainLayout>
    )
}

export default Version;