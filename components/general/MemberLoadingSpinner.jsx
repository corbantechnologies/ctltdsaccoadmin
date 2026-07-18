import { Loader2 } from "lucide-react";

function MemberLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="relative flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <Loader2 className="h-10 w-10 animate-spin text-primary absolute border-t-transparent" />
      </div>
      <p className="text-sm font-medium text-slate-500 animate-pulse">
        Loading secure data...
      </p>
    </div>
  );
}

export default MemberLoadingSpinner;
