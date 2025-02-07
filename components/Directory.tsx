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
import { useState } from "react";

const contracts = Array.from({ length: 50 }, (_, index) => {
  const engineers = ["Alice", "Bob", "Charlie", "Dana"];
  return {
    id: index + 1,
    event: `Contract ${index + 1}`,
    address: new Date(Date.now() - index * 3600 * 1000).toISOString(),
    engineer: engineers[index % engineers.length],
  };
});

export default function Directory() {
  // State for the current page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate total pages
  const totalPages = Math.ceil(contracts.length / itemsPerPage);

  // Determine the contracts for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContracts = contracts.slice(indexOfFirstItem, indexOfLastItem);

  // Handlers for pagination buttons
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

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
              {currentContracts.map((contract, index) => (
                <TableRow key={contract.address || index}>
                  <TableCell className="font-medium">
                    {contract.event}
                  </TableCell>
                  <TableCell className="text-right">
                    {contract.address}
                  </TableCell>
                  <TableCell className="text-right">
                    {contract.engineer}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <Button onClick={goToPreviousPage} disabled={currentPage === 1}>
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
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
