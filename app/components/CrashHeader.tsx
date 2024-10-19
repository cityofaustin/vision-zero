import { Crash } from "@/types/types";

interface CrashHeaderProps {
  crash: Crash;
}

export default function CrashHeader({ crash }: CrashHeaderProps) {
  return (
    <div>
      <h6 className="display-6">{crash.address_primary}</h6>
      <span>Updated by </span>
      <span className="me-1">{crash.updated_by}</span>

      <span>
        {crash.updated_at && new Date(crash.updated_at).toISOString()}
      </span>
    </div>
  );
}
