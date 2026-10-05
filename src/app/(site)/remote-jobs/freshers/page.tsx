import LandingPage, { landingMetadata } from "@/components/LandingPage";
import { landingFor } from "@/lib/landing";

const landing = landingFor("/remote-jobs/freshers")!;
export const generateMetadata = () => landingMetadata(landing);
export default function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <LandingPage landing={landing} searchParams={searchParams} />;
}
