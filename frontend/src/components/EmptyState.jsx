function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Icon className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-[#172033]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;
