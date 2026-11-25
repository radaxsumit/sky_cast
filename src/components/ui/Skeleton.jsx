// First-load placeholder in the dashboard's shape.
export function DashboardSkeleton() {
  const block = 'card animate-pulse rounded-[24px]';
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading weather">
      <div className="flex flex-col gap-2 pb-1">
        <div className="bg-ink-faint h-8 w-48 animate-pulse rounded-xl" />
        <div className="bg-ink-faint h-4 w-72 animate-pulse rounded-full" />
      </div>
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="h-[420px] animate-pulse rounded-[30px] bg-slate-300/60 lg:col-span-8 dark:bg-slate-800" />
        <div className={`${block} h-[420px] lg:col-span-4`} />
      </div>
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${block} h-40`} />
        ))}
      </div>
    </div>
  );
}
