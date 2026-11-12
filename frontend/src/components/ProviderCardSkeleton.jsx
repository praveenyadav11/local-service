function ProviderCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="h-3 w-1/3 rounded bg-slate-200" />
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-6 w-20 rounded-full bg-slate-200" />
        <div className="h-6 w-24 rounded-full bg-slate-200" />
      </div>
      <div className="mt-5 h-3 w-full rounded bg-slate-200" />
      <div className="mt-2 h-3 w-4/5 rounded bg-slate-200" />
      <div className="mt-6 flex gap-2">
        <div className="h-10 flex-1 rounded-xl bg-slate-200" />
        <div className="h-10 flex-1 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

export default ProviderCardSkeleton;
