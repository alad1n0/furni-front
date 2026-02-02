import {FC} from "react";

interface IVersionInformationCardProps {
    title: string
    date: string
    version: string
    description:  string
    videoSrc?: string
}

const VersionInformationCard: FC<IVersionInformationCardProps> = ({title, date, description, version, videoSrc = null}) => {
    return (
        <div className={'bg-react/500 p-[22px] w-full rounded-base-mini flex flex-col gap-[10px] overflow-hidden'}>
            <div className={'max-w-[1060px] flex-1 flex flex-row gap-2.5 items-center text-[20px] font-medium'}>
                <div className={'w-3 h-3 rounded-full bg-emerald/500'}/>
                <div>{title}</div>
                <div className={'text-black/400'}>{date}</div>
            </div>
            <div className={'text-black/400'}>{version}</div>
            <div dangerouslySetInnerHTML={{__html: description}}/>
            {videoSrc &&
                <img src={videoSrc} alt={'none'}/>
            }
        </div>
    );
};

export default VersionInformationCard;