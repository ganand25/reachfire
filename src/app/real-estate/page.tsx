import type { Metadata } from "next";
import { RealEstateClient } from "./RealEstateClient";

export const metadata: Metadata = {
  title: "Real Estate & Rental Income — ReachFire",
  description:
    "Analyze rental properties for FIRE. Calculate cap rate, cash-on-cash return, and see how rental income reduces your required portfolio.",
};

export default function RealEstatePage(): React.JSX.Element {
  return <RealEstateClient />;
}
