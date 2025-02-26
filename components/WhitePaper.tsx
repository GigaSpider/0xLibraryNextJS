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
              Beyond the scope of your traditional East/South Asian crypto scam
              or scamcoin offering. Ive decided to go outside of the box here,
              building upon existing technologies in order to make something
              which is actually useful to the end user.
              <br />
              <br />
              Everything is non custodial and decentralized. The private keys
              are controlled by you and there are no funny browser extensions
              like metamask to get in the way either. By not using metamask that
              means you can use this application from within tor browser.
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
