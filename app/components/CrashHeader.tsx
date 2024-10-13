import { Crash } from "@/types/types";

interface CrashHeaderProps {
  crash: Crash;
}

export default function CrashHeader({ crash }: CrashHeaderProps) {
  return <h6 className="display-6">{crash.address_primary}</h6>;
}
