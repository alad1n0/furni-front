export const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString('uk-UA', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};