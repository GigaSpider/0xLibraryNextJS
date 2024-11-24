"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

export default function Card1() {
  const [data, setData] = useState([]);

  return (
    <Card className="border-violet-500 h-[350px] w-[350px]">
      <CardHeader>
        <CardTitle className="text-center">Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        {!data ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Event</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <>No Activity Yet</>
        )}
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
