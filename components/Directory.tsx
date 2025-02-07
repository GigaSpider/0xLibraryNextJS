import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "./ui/label";

export default function Directory() {
  return (
    <Popover>
      <PopoverTrigger className="text-xs hover:text-violet-500 transition-colors">
        Smart Contract Directory
      </PopoverTrigger>
      <PopoverContent className="w-auto space-y-4">
        <div>
          <Label className="text-gray-400 font-semibold mb-2 block">
            Forums
          </Label>
          <ul className="space-y-2">
            <li className="text-xs">
              <span className="text-gray-400">Dread: </span>
              <span className="text-violet-500 hover:text-violet-400 cursor-pointer">
                http://dreadytofatroptsdj6io7l3xptbet6onoyno2yv7jicoxknyazubrad.onion
              </span>
            </li>
          </ul>
        </div>
        <div>
          <Label className="text-gray-400 font-semibold mb-2 block">
            Marketplaces
          </Label>
          <ul className="space-y-2">
            <li className="text-xs">
              <span className="text-gray-400">Archetype: </span>
              <span className="text-violet-500 hover:text-violet-400 cursor-pointer">
                http://zjfsopfrwpvqrhiy73vxb6zq7ksyffkzfyow2gmhgvjsseogy65uguyd.onion
              </span>
            </li>
            <li className="text-xs">
              <span className="text-gray-400">Bohemia: </span>
              <span className="text-violet-500 hover:text-violet-400 cursor-pointer">
                http://bohemiaobko4cecexkj5xmlaove6yn726dstp5wfw4pojjwp6762paqd.onion
              </span>
            </li>
          </ul>
        </div>
        <div>
          <Label className="text-gray-400 font-semibold mb-2 block">
            Services
          </Label>
          <ul className="space-y-2">
            <li className="text-xs">
              <span className="text-gray-400">Protonmail: </span>
              <span className="text-violet-500 hover:text-violet-400 cursor-pointer">
                https://protonmailrmez3lotccipshtkleegetolb73fuirgj7r4o4vfu7ozyd.onion
              </span>
            </li>
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
