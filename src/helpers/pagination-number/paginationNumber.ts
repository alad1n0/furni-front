export const usePaginationNumbers = (currentPage: number, totalPages: number): number[] => {
    const numbers: number[] = [];

    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    numbers.push(1);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) numbers.push(-1);

    for (let i = start; i <= end; i++) {
        numbers.push(i);
    }

    if (end < totalPages - 1) numbers.push(-1);
    numbers.push(totalPages);

    return numbers;
};