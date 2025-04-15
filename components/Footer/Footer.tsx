"use client";

import ToolBox from "@/components/Toolbox/ToolBox";
import Library from "@/components/Library";
import Chatbox from "@/components/Chatbox/Chatbox";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full py-4 px-6 flex justify-between items-center bg-black">
      <div className="flex-1 justify-start">
        <ToolBox />
      </div>
      <div className="flex-1 flex justify-center">
        <Library />
      </div>
      <div className="flex-1 flex justify-end">
        <Chatbox />
      </div>
    </footer>
  );
}
