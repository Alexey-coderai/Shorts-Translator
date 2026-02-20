import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";

type Status = "pending" | "processing" | "completed" | "failed";

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<Status, string> = {
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    processing: "bg-blue-500/10 text-blue-600 border-blue-200",
    completed: "bg-green-500/10 text-green-600 border-green-200",
    failed: "bg-red-500/10 text-red-600 border-red-200",
  };

  const icons: Record<Status, React.ReactNode> = {
    pending: <Clock className="w-3 h-3" />,
    processing: <Loader2 className="w-3 h-3 animate-spin" />,
    completed: <CheckCircle2 className="w-3 h-3" />,
    failed: <AlertCircle className="w-3 h-3" />,
  };

  const safeStatus = (status as Status) || "pending";

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
      styles[safeStatus]
    )}>
      {icons[safeStatus]}
      <span className="capitalize">{safeStatus}</span>
    </div>
  );
}
