import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  const items = [];
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const end = Math.min(pages, start + 4);
  for (let p = start; p <= end; p++) items.push(p);

  const base =
    "grid h-10 min-w-10 place-items-center rounded-xl border px-3 text-sm font-semibold transition";

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={`${base} border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {items.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`${base} ${
            p === page
              ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className={`${base} border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600`}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

export default Pagination;
