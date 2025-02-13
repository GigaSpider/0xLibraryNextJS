import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import DashboardMenu from "./DashboardMenu";

export default function ContractDashboard() {
  // const { CURRENT_CONTRACT_SELECTION_ADDRESS } = useSwapStore();

  return (
    <Card className="border-violet-500 h-[400px] w-[400px]">
      <CardHeader>
        <CardTitle className="text-center">Contract Dashboard</CardTitle>
        <CardDescription>Intialize contract to view dashboard</CardDescription>
      </CardHeader>
      <DashboardMenu />
      <CardContent>
        <DashboardMenu />
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
