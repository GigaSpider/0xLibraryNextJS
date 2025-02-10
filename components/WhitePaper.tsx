import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function WhitePaper() {
  return (
    <Sheet>
      <SheetTrigger className="text-xs hover:text-violet-500 transition-colors">
        White Paper (Start Here)
      </SheetTrigger>
      <SheetContent side="left" className="h-screen w-full">
        <ScrollArea className="h-full w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Instructions</SheetTitle>
            <SheetDescription>Purpose</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <p className="font-xs text-green-500">
              This application is an open market for Ethereum enthusiasts and
              developers to interact with and create new smart contracts that
              are made to be used the the end user directly — beyond the tired
              old crypto exchanges and NFTs that everybody has seen before. To
              get the ball rolling I have made a few smart contracts of my own
              which you are free to interact with and use for your own purposes,
              and which should give you an idea of what is expected from
              developer contributions made to this site. This project started as
              an attempt for me to make a crosschain solution between monero and
              ethereum, but expanded to make a directory that can have other
              smart contracts and accept developer contributions.
              <br />
              <br />
              Featuring your own smart contract in our directory is available
              for a price of 0.02ETH
              <br />
              <br />
            </p>
            <Label>Instructions on usage</Label>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Share on X</Button>
            </SheetClose>
          </SheetFooter>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
