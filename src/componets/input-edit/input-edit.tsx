import CheckSvg from "@/assets/check-svg";
import Button from "@/ui/button/Button";
import Input from "@/ui/input/Input";
import {ComponentProps, KeyboardEvent, FC, useEffect, useId, useState} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {cn} from "@/helpers/cn";

interface IField {
    field: string
}

interface IOfferNameInputTsProps extends ComponentProps<'div'> {
    field: string
    submitHandler: (data: string) => Promise<void>
}

const InputEdit: FC<IOfferNameInputTsProps> = ({className, field, submitHandler, ...rest}) => {
    const [isPending, setIsPending] = useState<boolean>(false)
    const {control, handleSubmit, setValue} = useForm<{ field: string }>({defaultValues: {field}})
    const [isClickedOutside, setIsClickedOutside] = useState(false);
    const id = useId()

    const onSubmit: SubmitHandler<IField> = async ({field: newField}) => {
        setIsPending(true)
        await submitHandler(newField)
            .finally(setIsPending.bind(null, false))
        setIsClickedOutside(false)
        setValue('field', field)
    }

    const handleClickOutside = (event: MouseEvent) => {
        const container = document.getElementById(id);
        if (container && !container.contains(event.target as Node)) {
            if (isClickedOutside && !isPending) {
                setIsClickedOutside(false)
                setValue('field', field)
            }
        } else setIsClickedOutside(true)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter')
            handleSubmit(onSubmit)()
    }

    useEffect(() => {
        setValue('field', field)
    }, [field])

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [id, isClickedOutside, isPending])

    return (
        <div {...rest} className={cn('!p-0 flex gap-0.5 border-0 relative', className)} id={id}>
            <Input
                className={cn('min-w-[50px] w-full', isClickedOutside && 'min-w-[150px] pr-[35px]')}
                classNameContainer={'w-full'}
                control={control}
                name={'field'}
                onKeyDown={handleKeyDown}
            />
            <Button
                className={cn(
                    'min-w-[32px] max-w-[32px] px-0 shrink-0 absolute right-[4px] top-1/2 transform -translate-y-1/2 pointer-events-none min-h-[25px] h-[32px] !p-0 opacity-0',
                    isClickedOutside && 'pointer-events-auto opacity-100',
                    isPending && 'pointer-events-none',
                )}
                isPending={isPending}
                onClick={handleSubmit(onSubmit)}
                color={'greenDarkgreen'}
            >
                <CheckSvg/>
            </Button>
        </div>
    );
};

export default InputEdit;