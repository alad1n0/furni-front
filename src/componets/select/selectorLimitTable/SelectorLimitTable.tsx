'use client'
import React, {ChangeEvent, ComponentProps} from "react";
import {cn} from "@/helpers/cn";
import {Chevrone} from "@/assets";

interface ISelectorProps<T> extends ComponentProps<'div'> {
    options: Array<T> | undefined
    optionValue?: keyof T
    optionLabel?: keyof T
    placeholder?: string
    getAndSet: [state: never | null | number | string, setState: (limit: never) => void]
    label?: string
    isBlackDefault?: boolean
    isEmptyValueDisable?: boolean
}

const Selector = <T, >({options, optionValue, optionLabel, className, placeholder, getAndSet, isEmptyValueDisable = false, label = '', isBlackDefault = false, ...rest}: ISelectorProps<T>) => {
    const [state, setState] = getAndSet

    const getOptionValue = (option: T) => {
        if (typeof option === 'object' && option && optionValue) {
            return option[optionValue];
        }
        return option;
    }

    const getOptionLabel = (option: T) => {
        if (typeof option === 'object' && option && optionLabel) {
            return option[optionLabel];
        }
        if (typeof option === 'object' && option && optionValue) {
            return option[optionValue];
        }
        return option;
    }

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        const parsedValue = !isNaN(Number(value)) && value !== '' ? Number(value) : value;
        setState(parsedValue as never);
    }

    return (
        <div {...rest} className={cn('flex flex-col gap-[5px] relative h-fit cursor-pointer', className)}>
            {!!label && <p className={'text-xs font-semibold pl-4'}>{label}</p>}
            <img
                className={'w-4 h-4 absolute right-3 rotate-90 bottom-[11px] fill-emerald/500 pointer-events-none'}
                src={Chevrone}
                alt={'chevrone'}
            />
            <select
                value={state !== null && state !== undefined ? String(state) : ''}
                onChange={handleChange}
                className={cn(
                    'px-4 h-[40px] font-medium rounded-[12px] min-w-[80px] outline-none focus:ring-0 text-base w-full text-ellipsis bg-react/500 pr-10 appearance-none cursor-pointer',
                    !state && !isBlackDefault && 'text-react/300',
                )}
            >
                {placeholder && (
                    <option value={''} disabled={isEmptyValueDisable} className={'text-react/300'}>
                        {placeholder}
                    </option>
                )}
                {options?.map((option, index) => (
                    <option key={index} value={String(getOptionValue(option))}>
                        {String(getOptionLabel(option))}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Selector;