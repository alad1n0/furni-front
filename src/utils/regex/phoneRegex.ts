export const phoneRegex = {
    required: "Номер телефону обов'язковий",
    pattern: {
        value: /^\+380\d{9}$/,
        message: "Номер повинен починатися з +380 і містити 9 цифр.",
    },
}