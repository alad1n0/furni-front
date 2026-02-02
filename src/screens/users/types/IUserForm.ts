export interface IUserForm {
    name: string;
    email: string;
    password: string;
    marker: string;
    role_id: number;
    source_id?: number | null;
}