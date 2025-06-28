import Image from "next/image";
import Link from "next/link";
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
// import {
//   Pagination,
//   PaginationItem,
//   PaginationPrevious,
//   PaginationNext,
//   PaginationLink,
// } from "@/components/ui/pagination";
import { useContractStore, SmartContract } from "@/hooks/store/contractStore";
// import { Separator } from "@/components/ui/separator";

export default function Library() {
  const { set_SELECTED_CONTRACT, contracts, set_INITIALIZED_CONTRACT } =
    useContractStore();
  // const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 10;
  // const totalPages = Math.ceil(contracts.length / itemsPerPage);

  // Calculate indices for the current page
  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContracts = contracts; //.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Drawer>
      <DrawerTrigger>
        <Button
          variant="default"
          // className="border-red-500 text-red-500 hover:bg-red-500 hover:text-black bg-black"
        >
          📝 Contract Library 📚
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-black border-violet-400">
        <div className="mx-auto w-full">
          <DrawerHeader className="justify-center ">
            <DrawerTitle>Contract Library</DrawerTitle>
            <DrawerDescription>
              Choose an Ethereum Smart Contract to interact with.
            </DrawerDescription>
          </DrawerHeader>
          <Table className="text-gray-600">
            <TableHeader>
              <TableRow>
                <TableHead>Contract Name</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Engineer</TableHead>
                <TableHead>Network</TableHead>
                <TableHead className="text-right">Proxy?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentContracts.map((contract: SmartContract) => (
                <TableRow
                  key={contract.id}
                  onClick={() => {
                    set_INITIALIZED_CONTRACT(null);
                    set_SELECTED_CONTRACT(contract);
                  }}
                >
                  <TableCell className="font-medium">{contract.name}</TableCell>
                  <TableCell>{contract.fee}%</TableCell>
                  <TableCell className="text-green-400">
                    {contract.address}
                  </TableCell>
                  <TableCell>{contract.engineer}</TableCell>
                  <TableCell>{contract.chainId}</TableCell>
                  <TableCell className="text-right">
                    {contract.proxy.toString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* <Pagination className="mt-4">
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
          </Pagination> */}

          <br />

          <div className="flex ml-9">
            <div>
              <Image
                src="/git.png"
                alt="Library icon"
                width={50}
                height={50}
                className=""
              />
            </div>

            <div className="ml-9 mr-9 text-center text-gray-400">
              Smart contracts featured in the library are open source and can be
              viewed{" "}
              <Link
                href="https://github.com/GigaSpider/0xLibrary-Contracts"
                target="_blank"
                className="text-green-400"
              >
                here
              </Link>
              . Pull requests to this repository are highly encouraged and will
              be reviewed ASAP. Any for-profit contract which is merged into the
              0xlibrary contracts repository will share profits with the
              engineer at a 5:95 split.
            </div>
          </div>
          <DrawerFooter className="flex justify-center items-center">
            <DrawerClose asChild>
              <Button variant="ghost" className="w-40">
                Close Library
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
