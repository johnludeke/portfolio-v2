import type { Metadata } from "next";
import { hasGate } from "@/lib/trouble-server";
import GatePassword from "@/components/trouble/GatePassword";
import TroubleApp from "@/components/trouble/TroubleApp";

export const metadata: Metadata = {
  title: "trouble",
  robots: { index: false, follow: false },
};

// Reading the gate cookie opts this route into dynamic rendering.
export default async function TroublePage() {
  const gated = await hasGate();
  return gated ? <TroubleApp /> : <GatePassword />;
}
