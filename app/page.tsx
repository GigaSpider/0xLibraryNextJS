import Card1 from "@/components/Card1";
import Card2 from "@/components/Card2";
import Card3 from "@/components/Card3";

export default function Home() {
  return (
    <div className="flex justify-center items-center space-x-6 h-screen">
      <Card1 />
      <Card2 />
      <Card3 />
    </div>
  );
}
