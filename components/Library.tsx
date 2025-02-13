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
  PaginationLink,
} from "@/components/ui/pagination";
import { useContractStore, Contract } from "@/hooks/store/contractStore";

export default function Library() {
  const { set_SELECTED_CONTRACT, contracts } = useContractStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(contracts.length / itemsPerPage);

  // Calculate indices for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContracts = contracts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Drawer>
      <DrawerTrigger>Contract Library</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full">
          <DrawerHeader>
            <DrawerTitle>Contract Library</DrawerTitle>
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
                <TableHead className="text-right">Proxy?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentContracts.map((contract: Contract) => (
                <TableRow
                  key={contract.id}
                  onClick={() => set_SELECTED_CONTRACT(contract)}
                >
                  <TableCell className="font-medium">{contract.name}</TableCell>
                  <TableCell>{contract.address}</TableCell>
                  <TableCell>{contract.engineer}</TableCell>
                  <TableCell>{contract.network}</TableCell>
                  <TableCell className="text-right">
                    {contract.proxy.toString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination className="mt-4">
            <PaginationPrevious
              onClick={() => {
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
            />
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink onClick={() => setCurrentPage(pageNumber)}>
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationNext
              onClick={() => {
                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
              }}
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
