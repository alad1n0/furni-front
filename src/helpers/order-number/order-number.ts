export const generateOrderNumber = (length: number = 5) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let orderNumber = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        orderNumber += chars.charAt(randomIndex);
    }

    return orderNumber;
};