import React, { FC } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ButtonPg } from '@/ui/button/ButtonPg';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from '@/ui/pagination/pagination';
import {usePaginationNumbers} from "@/helpers/pagination-number/paginationNumber";

interface PaginationControlProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
}

const PaginationControl: FC<PaginationControlProps> = ({ currentPage, totalPages, onPageChange, disabled = false }) => {
    const paginationNumbers = usePaginationNumbers(currentPage, totalPages);
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex justify-center gap-6 items-center py-4">
            <ButtonPg
                variant="outline"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={isFirstPage || disabled}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
            </ButtonPg>

            <Pagination>
                <PaginationContent>
                    {paginationNumbers.map((pageNum, index) =>
                        pageNum === -1 ? (
                            <PaginationEllipsis key={`ellipsis-${index}`} />
                        ) : (
                            <PaginationItem key={pageNum}>
                                <PaginationLink
                                    isActive={pageNum === currentPage}
                                    onClick={() => !disabled && onPageChange(pageNum)}
                                    style={{
                                        cursor: disabled ? 'not-allowed' : 'pointer',
                                        opacity: disabled ? 0.5 : 1,
                                    }}
                                >
                                    {pageNum}
                                </PaginationLink>
                            </PaginationItem>
                        )
                    )}
                </PaginationContent>
            </Pagination>

            <ButtonPg
                variant="outline"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={isLastPage || disabled}
            >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
            </ButtonPg>
        </div>
    );
};

export default PaginationControl;