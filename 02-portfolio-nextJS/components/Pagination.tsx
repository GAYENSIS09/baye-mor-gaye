'use client';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, lastPage, total, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= lastPage; i++) {
    if (i === 1 || i === lastPage || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="px-3 py-1 rounded text-sm border border-[#333] text-muted hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed">
        Precedent
      </button>
      {pages.map((page, i) => (
        <span key={page} className="flex items-center gap-1">
          {i > 0 && pages[i - 1] !== page - 1 && <span className="text-muted">...</span>}
          <button onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded text-sm ${page === currentPage ? 'bg-acid text-black' : 'border border-[#333] text-muted hover:bg-[#222]'}`}
            aria-current={page === currentPage ? 'page' : undefined}>
            {page}
          </button>
        </span>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === lastPage}
        className="px-3 py-1 rounded text-sm border border-[#333] text-muted hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed">
        Suivant
      </button>
    </div>
  );
}
