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
            <Label>Instructions</Label>
            <p className="font-xs text-green-500">Work in progress</p>
            <Label>Security Considerations</Label>
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
