// First-load placeholder in the dashboard's shape, over the neutral sky.
export function DashboardSkeleton() {
  const block = 'glass animate-pulse rounded-[26px]';
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading weather">
      <div className="flex flex-col gap-4 pt-6 pb-10">
        <div className="h-5 w-48 animate-pulse rounded-full bg-white/30" />
        <div className="h-36 w-64 animate-pulse rounded-3xl bg-white/20" />
        <div className="h-5 w-40 animate-pulse rounded-full bg-white/25" />
      </div>
      <div className={`${block} h-48`} />
      <div className="grid gap-5 md:grid-cols-3">
        <div className={`${block} h-64`} />
        <div className={`${block} h-64 md:col-span-2`} />
      </div>
    </div>
  );
}
