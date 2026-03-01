import type { Metadata } from "next";
import { CoastClient } from "./CoastClient";

export const metadata: Metadata = {
  title: "Coast FIRE Calculator — ReachFire",
  description: "Find when you can stop saving and let compound growth reach your FIRE number.",
};

export default function CoastPage(): React.JSX.Element {
  return <CoastClient />;
}
