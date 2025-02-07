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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function WhitePaper() {
  return (
    <Sheet>
      <SheetTrigger className="text-xs hover:text-violet-500 transition-colors">
        White Paper
      </SheetTrigger>
      <SheetContent side="left" className="h-screen w-96 max-w-80">
        <ScrollArea className="h-full w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>White Paper</SheetTitle>
            <SheetDescription>Mission Statement</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="">
              My aim for this project is to facilitate the progress of tangible
              real world usecases on top of existing smart contract technology
              without relying on venture capital or traditional Silicon Valley
              business models. This is to remain a community driven project with
              an emphasis on low overhead and extreme efficiency
              <br />
              <br />
              In the current crypto/defi space you may see a lot of the same
              tired old business strategies that exist solely order to extract
              money out of the users without actually providing any real valuble
              products that make anybody's' life better. There are crypto
              exchanges ad infinitum, defi lending protocols that dont actually
              lend anybody any money, but very little in the way of actual user
              services. I want this platform to be the thrust in changing that
              and facilitate new growth.
              <br />
              <br />
              Our goal here should be to remove power from huge corporations and
              governments and place it in the hands of the devloper and the
              cryptocurrency holder. That is the whole point of the project as
              was originally planned by Paul Le Roux almost 20 years ago. I want
              to offer the opportunity for talented broke young people to market
              their skills directly to users on the platform in a fair and open
              market. And I want to offer consumers the best place possible to
              use their Ethereum and make it work for them without needing to
              worry about beurocratic oversight.
            </div>
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
