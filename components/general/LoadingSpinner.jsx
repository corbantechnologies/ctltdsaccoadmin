import { Loader2 } from "lucide-react";

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="relative flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--accent)] opacity-20" />
        <Loader2 className="h-12 w-12 animate-spin text-[var(--accent)] absolute border-t-transparent" />
      </div>
      <p className="text-sm font-medium text-slate-500 animate-pulse uppercase tracking-[2px]">
        Initializing Admin Secure Space...
      </p>
    </div>
  );
}

export default LoadingSpinner;
