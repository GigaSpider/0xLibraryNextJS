"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useEventStore } from "@/hooks/store/eventStore";

export default function Card1() {
  const { events } = useEventStore();

  const sorted = [...events].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <Card className="border-violet-500 h-[400px] w-[400px]">
      <CardHeader>
        <CardTitle className="text-center">Activity Feed</CardTitle>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[300px] w-[350px] rounded-md">
          {events ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Event</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((event) => (
                  <TableRow key={event.timestamp}>
                    <TableCell className="font-medium">{event.event}</TableCell>
                    <TableCell className="text-right">
                      {event.timestamp}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <>No Activity Yet</>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
