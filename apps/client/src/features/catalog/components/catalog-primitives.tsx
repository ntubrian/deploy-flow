import { ChevronDown, ChevronLeft, Search, X } from 'lucide-react';

import noDataImage from '../assets/no-data.svg';

import type {
  CatalogCategoryOption,
  CatalogTabDefinition,
  CatalogTabKey,
} from '../catalog-types';

export function CatalogMobileShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-[#dcdcdc] md:p-6">
      <div className="mx-auto flex h-dvh min-h-dvh w-full max-w-[375px] flex-col overflow-hidden bg-[#f4f4f6] md:h-[812px] md:min-h-[812px] md:rounded-[28px]">
        {children}
      </div>
    </main>
  );
}

export function CatalogHeader() {
  return (
    <header className="bg-[#c9191d] px-4 pb-3 pt-4 text-white">
      <div className="relative flex items-center justify-center">
        <button
          aria-label="返回上一頁"
          className="absolute left-0 inline-flex h-7 w-7 items-center justify-center text-white"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              window.history.back();
            }
          }}
          type="button"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
        </button>
        <h1 className="text-[17px] font-semibold tracking-[0.01em]">
          所有捐款項目
        </h1>
      </div>
    </header>
  );
}

export function CatalogTabs({
  activeTab,
  onChange,
  tabs,
}: {
  activeTab: CatalogTabKey;
  onChange: (tab: CatalogTabKey) => void;
  tabs: readonly CatalogTabDefinition[];
}) {
  const activeIndex = Math.max(
    tabs.findIndex((tab) => tab.key === activeTab),
    0
  );

  return (
    <nav className="border-b border-black/5 bg-white">
      <div className="relative">
        <ul className="flex">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <li className="min-w-0 flex-1" key={tab.key}>
                <button
                  className={`relative flex h-[46px] w-full items-end justify-center pb-[10px] font-medium transition-colors ${
                    isActive ? 'text-[16px] text-[#171718]' : 'text-[14px] text-black/45'
                  }`}
                  onClick={() => onChange(tab.key)}
                  type="button"
                >
                  <span className="truncate">{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <span
          className="pointer-events-none absolute bottom-0 left-0 flex justify-center transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${activeIndex * 100}%)`,
            width: `${100 / tabs.length}%`,
          }}
        >
          <span className="h-[2px] w-[62px] rounded-t-[999px] bg-[#d5191d]" />
        </span>
      </div>
    </nav>
  );
}

export function CatalogCompactControls({
  categoryLabel,
  onOpenCategoryModal,
  onOpenSearch,
}: {
  categoryLabel: string;
  onOpenCategoryModal: () => void;
  onOpenSearch: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-[#f4f4f6] px-[15px] py-3">
      <button
        className="inline-flex h-[30px] shrink-0 items-center gap-1 rounded-md bg-[#ededf1] px-3 text-[13px] font-medium text-black/70"
        onClick={onOpenCategoryModal}
        type="button"
      >
        <span className="max-w-[120px] truncate">{categoryLabel}</span>
        <ChevronDown className="h-4 w-4" strokeWidth={2} />
      </button>
      <button
        aria-label="開啟搜尋"
        className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ededf1] text-black/45"
        onClick={onOpenSearch}
        type="button"
      >
        <Search className="h-4 w-4" strokeWidth={2.2} />
      </button>
    </div>
  );
}

export function CatalogExpandedSearchBar({
  inputRef,
  onCancel,
  onChange,
  value,
}: {
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onCancel: () => void;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-white px-[15px] py-[10px]">
      <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#ededf1] px-4 text-black/45">
        <Search className="h-4 w-4 shrink-0" strokeWidth={2.2} />
        <input
          className="min-w-0 flex-1 bg-transparent text-[14px] leading-none text-black outline-none placeholder:text-black/30"
          onChange={(event) => onChange(event.target.value)}
          placeholder="搜尋"
          ref={inputRef}
          value={value}
        />
      </label>
      <button
        className="shrink-0 text-[15px] font-medium text-[#007aff]"
        onClick={onCancel}
        type="button"
      >
        取消
      </button>
    </div>
  );
}

export function CatalogEmptyState() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-7 pb-16 pt-10 text-center">
      <img
        alt=""
        aria-hidden="true"
        className="h-36 w-36 object-contain"
        src={noDataImage}
      />
      <h2 className="mt-6 text-[20px] leading-[1.4] font-medium text-black/90">
        查無相關資料
      </h2>
      <p className="mt-[6px] text-[14px] leading-[22px] text-black/50">
        請調整關鍵字再重新搜尋
      </p>
    </div>
  );
}

export function CatalogSpinner({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`catalog-spinner ${className}`.trim()}
    />
  );
}

export function CatalogSearchLoadingState() {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <CatalogSpinner className="h-6 w-6" />
    </div>
  );
}

export function CatalogErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-[15px] py-10">
      <div className="rounded-2xl bg-white px-5 py-6 text-center">
        <p className="text-[17px] font-semibold text-[#171718]">資料載入失敗</p>
        <p className="mt-2 text-[13px] leading-6 text-black/45">
          請稍後再試，或重新整理頁面。
        </p>
        <button
          className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#c9191d] px-5 text-[14px] font-semibold text-white"
          onClick={onRetry}
          type="button"
        >
          重新整理
        </button>
      </div>
    </div>
  );
}

export function CatalogEndMarker() {
  return (
    <div className="flex items-center justify-center gap-[9px] px-0 py-3 text-[13px] leading-5 font-normal text-black/20">
      <span className="h-px flex-1 bg-black/20" />
      <span className="shrink-0">愛心沒有底線</span>
      <span className="h-px flex-1 bg-black/20" />
    </div>
  );
}

export function CatalogCategoryModal({
  categories,
  isVisible,
  onClose,
  onSelect,
  selectedCategoryId,
}: {
  categories: readonly CatalogCategoryOption[];
  isVisible: boolean;
  onClose: () => void;
  onSelect: (categoryId: string | null) => void;
  selectedCategoryId: string | null;
}) {
  return (
    <div
      className={`fixed inset-0 z-40 flex items-end justify-center bg-black/50 transition-opacity duration-200 ease-out md:px-6 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <section
        className={`w-full max-w-[375px] rounded-t-[24px] bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+1.75rem)] pt-5 transition-all duration-200 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <h2 className="text-[17px] font-semibold text-[#171718]">選擇類別</h2>
          <button
            aria-label="關閉類別選單"
            className="absolute right-0 inline-flex h-8 w-8 items-center justify-center text-black/35"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <div className="-mx-4 mb-5 mt-4 h-px bg-black/8" />
        <div className="grid grid-cols-3 gap-2.5">
          {categories.map((category) => {
            const isSelected = category.id === selectedCategoryId;

            return (
              <button
                className={`flex h-[36px] items-center justify-center rounded-[8px] border text-[13px] font-medium transition-colors ${
                  isSelected
                    ? 'border-[#d5191d] bg-white text-[#d5191d]'
                    : 'border-transparent bg-[#f4f4f6] text-[#171718]'
                }`}
                key={category.id ?? 'all'}
                onClick={() => onSelect(category.id)}
                type="button"
              >
                <span className="truncate">{category.name}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
