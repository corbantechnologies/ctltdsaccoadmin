import React from "react";
import { Ghost } from "lucide-react";

export default function EmptyState({
  title = "No data found",
  message = "There is nothing to display here at the moment.",
  icon: Icon = Ghost,
  action = null,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded border border-dashed bg-gray-50/50 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        {message}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
