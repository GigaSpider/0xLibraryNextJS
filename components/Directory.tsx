import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
// Import shadcn’s built-in pagination components
import {
  Pagination,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

const contracts = Array.from({ length: 50 }, (_, index) => {
  const engineers = ["ADMIN", "Bob", "Charlie", "Dana"];
  return {
    id: index + 1,
    event: `Contract ${index + 1}`,
    address: new Date(Date.now() - index * 3600 * 1000).toISOString(),
    engineer: engineers[index % engineers.length],
  };
});

export default function Directory() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(contracts.length / itemsPerPage);

  // Calculate indices for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContracts = contracts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Drawer>
      <DrawerTrigger>Contract Directory</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full">
          <DrawerHeader>
            <DrawerTitle>Contract Directory</DrawerTitle>
            <DrawerDescription>
              Choose a contract to interact with.
            </DrawerDescription>
          </DrawerHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Engineer</TableHead>
                <TableHead>Network</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">
                    {contract.event}
                  </TableCell>
                  <TableCell className="text-right">
                    {contract.address}
                  </TableCell>
                  <TableCell className="text-right">
                    {contract.engineer}
                  </TableCell>
                  <TableCell className="text-right">Optimism</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination using shadcn components */}
          <Pagination className="mt-4">
            <PaginationPrevious
              onClick={() => {
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
              // Use className to mimic a disabled state
              className={
                currentPage === 1 ? "opacity-50 pointer-events-none" : ""
              }
            />
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <PaginationItem
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  // Apply active styling via className when the page number matches the current page
                  className={
                    pageNumber === currentPage ? "bg-blue-500 text-white" : ""
                  }
                >
                  {pageNumber}
                </PaginationItem>
              );
            })}
            <PaginationNext
              onClick={() => {
                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
              }}
              className={
                currentPage === totalPages
                  ? "opacity-50 pointer-events-none"
                  : ""
              }
            />
          </Pagination>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close Menu</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
