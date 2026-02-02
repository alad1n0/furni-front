import Input from "@/ui/input/Input";
import {SubmitHandler, useForm} from "react-hook-form";
import {ITokenForm} from "@/screens/auth/types/ITokenForm";
import Button from "@/ui/button/Button";
import {useAuthViaTokenMutation} from "@/screens/auth/hooks/useAuthViaTokenMutation";
import {requiredRegex} from "@/utils/regex/required";
import MainLayout from "@/ui/layouts/main-layout/MainLatout";

const Auth = () => {
    const {control, handleSubmit} = useForm<ITokenForm>();
    const {mutateAsync: mutateAsyncAuthViaToken, isPending: isPendingAuthViaToken} = useAuthViaTokenMutation();
    const submitHandler: SubmitHandler<ITokenForm> = async (data) => {
        await mutateAsyncAuthViaToken(data);
    };

    return (
        <MainLayout>
            <div className={'flex flex-col gap-5 w-full max-w-[400px] m-auto'}>
                <Input
                    control={control}
                    name={'email'}
                    rules={requiredRegex}
                    placeholder={'Email'}
                    type={'email'}
                />
                <Input
                    control={control}
                    name={'password'}
                    rules={requiredRegex}
                    placeholder={'Password'}
                    type={'password'}
                />
                <Button
                    onClick={handleSubmit(submitHandler)}
                    isPending={isPendingAuthViaToken}
                >
                    Login
                </Button>
            </div>
        </MainLayout>
    );
};

export default Auth;