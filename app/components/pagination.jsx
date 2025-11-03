export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const clamp = (p) => Math.min(Math.max(p, 1), totalPages);
  const goto = (p) => onPageChange(clamp(p));

  const getPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set([1, totalPages, currentPage]);
    pages.add(currentPage - 1);
    pages.add(currentPage + 1);
    pages.add(2);
    pages.add(totalPages - 1);

    return Array.from(pages)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
  };

  const pages = getPages();

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => goto(currentPage - 1)}
        disabled={currentPage <= 1}
        className={`px-4 py-2 border rounded-md ${
          currentPage <= 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-100"
        }`}
      >
        ← Previous
      </button>

      {pages.map((p, idx) => {
        const prev = pages[idx - 1];
        const needDots = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center">
            {needDots && <span className="px-2 text-gray-500">…</span>}
            <button
              onClick={() => goto(p)}
              className={`px-3 py-1 rounded-md border ${
                p === currentPage
                  ? "bg-green-200 font-semibold"
                  : "hover:bg-green-50"
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => goto(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`px-4 py-2 border rounded-md ${
          currentPage >= totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-100"
        }`}
      >
        Next →
      </button>
    </div>
  );
}
