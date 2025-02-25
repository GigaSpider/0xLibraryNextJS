import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Header() {
  return (
    <nav>
      <div className="left-2 top-2">
        {" "}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="text-xs">
              Wallet Actions
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Actions</h4>
                <p className="text-sm text-muted-foreground">
                  Set the dimensions for the layer.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="width">Create New Wallet</Label>
                  <Button>Create</Button>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="maxWidth">Unlock Existing Wallet</Label>
                  <Input
                    id="maxWidth"
                    className="col-span-2 h-8"
                    placeholder="private key"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="height">Send Ethereum</Label>
                  <Input
                    id="height"
                    defaultValue="25px"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="maxHeight">Max. height</Label>
                  <Input
                    id="maxHeight"
                    defaultValue="none"
                    className="col-span-2 h-8"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <p>address</p>
      </div>
    </nav>
  );
}
