function StatTile({ icon: Icon, label, value, tone, hint }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tone}`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold leading-none text-[#172033]">
          {value ?? "-"}
        </p>
        <p className="mt-1 truncate text-xs font-semibold text-slate-500">
          {label}
        </p>
        {hint && <p className="truncate text-[11px] text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}

export default StatTile;
