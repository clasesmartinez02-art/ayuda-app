'use client';

import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/20", className)}
      {...props}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Presence */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="w-32 h-3" />
      </div>

      {/* Greeting */}
      <div className="space-y-3">
        <Skeleton className="w-3/4 h-10" />
        <Skeleton className="w-1/2 h-4" />
      </div>

      {/* Pulse Card */}
      <Skeleton className="w-full aspect-[2/1] rounded-[2.5rem]" />

      {/* Emotion Picker */}
      <Skeleton className="w-full h-24 rounded-3xl" />

      {/* Support Card */}
      <Skeleton className="w-full h-40 rounded-[2rem]" />

      {/* Quick Actions */}
      <div className="space-y-4">
        <Skeleton className="w-24 h-4 ml-1" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
