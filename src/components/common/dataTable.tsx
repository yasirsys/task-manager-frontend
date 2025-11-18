import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface DataTableProps<T> {
  columns: {
    label: string;
    render: (item: T) => React.ReactNode;
    className?: string;
  }[];

  data: T[];
  loading: boolean;
  emptyMessage?: string;
  emptyDescription?: string;

  // Pagination
  pagination?: {
    currentPage: number;
    totalPages: number;
    skip: number;
    limit: number;
    setPagination: React.Dispatch<
      React.SetStateAction<{ skip: number; limit: number }>
    >;
  };
}

export function DataTable<T>({
  columns,
  data,
  loading,
  emptyMessage = "No records found",
  emptyDescription = "There are no records to display.",
  pagination,
}: DataTableProps<T>) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead key={idx} className={col.className}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                <div className="flex justify-center items-center gap-2">
                  <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-10 text-muted-foreground"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-2">
                    📂
                  </div>
                  <p>{emptyMessage}</p>
                  <p className="text-sm mt-2">{emptyDescription}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, idx) => (
              <TableRow key={idx}>
                {columns.map((col, cIdx) => (
                  <TableCell key={cIdx}>{col.render(item)}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Section */}
      {pagination && data.length > 0 && !loading && (
        <div className="flex justify-center items-center gap-2 p-4 border-t">
          {/* Previous */}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              pagination.setPagination((prev) => ({
                ...prev,
                skip: Math.max(0, prev.skip - prev.limit),
              }))
            }
            disabled={pagination.currentPage === 1}
          >
            &lt;
          </Button>

          {/* Left Ellipsis */}
          {pagination.currentPage > 3 && (
            <span className="px-2 text-muted-foreground">...</span>
          )}

          {/* Dynamic Page List */}
          {Array.from({ length: 3 }, (_, i) => {
            let startPage = pagination.currentPage;

            if (pagination.currentPage <= 2) startPage = 1;
            else if (pagination.currentPage >= pagination.totalPages - 1)
              startPage = pagination.totalPages - 2;
            else startPage = pagination.currentPage - 1;

            const pageNum = startPage + i;

            if (pageNum < 1 || pageNum > pagination.totalPages) return null;

            return (
              <Button
                key={pageNum}
                variant={
                  pageNum === pagination.currentPage ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  pagination.setPagination((prev) => ({
                    ...prev,
                    skip: (pageNum - 1) * prev.limit,
                  }))
                }
              >
                {pageNum}
              </Button>
            );
          })}

          {/* Right Ellipsis */}
          {pagination.currentPage < pagination.totalPages - 2 && (
            <span className="px-2 text-muted-foreground">...</span>
          )}

          {/* Next */}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              pagination.setPagination((prev) => ({
                ...prev,
                skip: Math.min(
                  (pagination.totalPages - 1) * prev.limit,
                  prev.skip + prev.limit
                ),
              }))
            }
            disabled={pagination.currentPage === pagination.totalPages}
          >
            &gt;
          </Button>
        </div>
      )}
    </div>
  );
}
