import * as React from "react";

import { cn } from "@/lib/utils";

export function Select(props: React.ComponentProps<"select">) {
  const { className, children, ...rest } = props;
  return (
    <select className={cn("select flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm", className)} {...rest}>
      {children}
    </select>
  );
}
