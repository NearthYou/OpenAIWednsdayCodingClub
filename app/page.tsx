import { MarketRadarApp } from "@/components/market-radar-app";
import { getFallbackBrief } from "@/lib/market-brief";

export default function HomePage() {
  return <MarketRadarApp initialBrief={getFallbackBrief("global")} />;
}
