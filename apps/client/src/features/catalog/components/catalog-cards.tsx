import { formatTwdPrice } from '../catalog-utils'

import type {
  CatalogDonationProjectListItemFragment,
  CatalogOrganizationListItemFragment,
  CatalogSaleProductListItemFragment,
} from '../../../graphql/generated'

function CheckerboardThumb({
  className,
}: {
  className: string
}) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        backgroundImage:
          'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.05) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.05) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.05) 75%)',
        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
        backgroundSize: '16px 16px',
      }}
    />
  )
}

function CardImage({
  alt,
  className,
  src,
}: {
  alt: string
  className: string
  src: string
}) {
  if (!src) {
    return <CheckerboardThumb className={className} />
  }

  return (
    <img
      alt={alt}
      className={className}
      loading="lazy"
      src={src}
    />
  )
}

function CategoryTagIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[14px] w-[16px] shrink-0 text-[#f7c6c3]"
      fill="currentColor"
      viewBox="0 0 16 14"
    >
      <path d="M1.32 7.14 6.83 1.62c.22-.22.52-.34.83-.34h4.89c.88 0 1.59.71 1.59 1.59v4.89c0 .31-.12.61-.34.83l-5.52 5.51a1.17 1.17 0 0 1-1.65 0L1.32 8.79a1.16 1.16 0 0 1 0-1.65Z" />
      <circle cx="11.02" cy="4.4" fill="#fff" r="1.15" />
    </svg>
  )
}

export function OrganizationCard({
  item,
}: {
  item: CatalogOrganizationListItemFragment
}) {
  return (
    <article className="flex h-[84px] items-center gap-3 rounded-[12px] bg-white px-3 py-[9px]">
      <CardImage
        alt={item.logo.altText}
        className="h-[60px] w-[60px] rounded-[6px] border border-black/10 object-cover"
        src={item.logo.url}
      />
      <div className="min-w-0 flex-1">
        <h2 className="line-clamp-1 text-[16px] font-semibold leading-6 text-[#171718]">
          {item.name}
        </h2>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-[1.45] text-black/45">
          {item.summary}
        </p>
      </div>
    </article>
  )
}

export function DonationProjectCard({
  item,
}: {
  item: CatalogDonationProjectListItemFragment
}) {
  return (
    <article className="overflow-hidden rounded-[12px] bg-white">
      <CardImage
        alt={item.cover.altText}
        className="h-[168px] w-full object-cover"
        src={item.cover.url}
      />
      <div className="px-3 pb-4 pt-2.5">
        <p className="text-[11px] font-semibold tracking-[0.01em] text-[#d5191d]">
          {item.organization.name}
        </p>
        <h2 className="mt-1 line-clamp-2 text-[18px] font-semibold leading-6 text-[#171718]">
          {item.title}
        </h2>
        <div className="mt-2 flex items-start gap-1.5 text-[11px] text-black/30">
          <CategoryTagIcon />
          <p className="line-clamp-1 min-w-0 leading-[1.45]">
            {item.categories
              .slice(0, 3)
              .map((category) => category.name)
              .join('・')}
          </p>
        </div>
      </div>
    </article>
  )
}

export function SaleProductCard({
  item,
}: {
  item: CatalogSaleProductListItemFragment
}) {
  return (
    <article className="overflow-hidden rounded-[12px] bg-white">
      <CardImage
        alt={item.cover.altText}
        className="h-[108px] w-full object-cover"
        src={item.cover.url}
      />
      <div className="px-2.5 pb-3 pt-2">
        <h2 className="line-clamp-2 min-h-[40px] text-[14px] font-semibold leading-5 text-[#171718]">
          {item.title}
        </h2>
        <p className="mt-1 line-clamp-1 text-[11px] leading-4 text-black/45">
          {item.organization.name}
        </p>
        <p className="mt-3 text-[13px] font-bold leading-none text-[#d5191d]">
          {formatTwdPrice(item.priceAmount)}
        </p>
      </div>
    </article>
  )
}

export function OrganizationCardSkeleton() {
  return (
    <div className="flex h-[84px] animate-pulse items-center gap-3 rounded-[12px] bg-white px-3 py-[9px]">
      <div className="h-[60px] w-[60px] rounded-[6px] bg-black/5" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded-full bg-black/5" />
        <div className="h-3 w-full rounded-full bg-black/5" />
        <div className="h-3 w-3/4 rounded-full bg-black/5" />
      </div>
    </div>
  )
}

export function DonationProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[12px] bg-white">
      <div className="h-[168px] animate-pulse bg-black/5" />
      <div className="space-y-2 px-3 pb-4 pt-3">
        <div className="h-3 w-1/3 rounded-full bg-black/5" />
        <div className="h-5 w-4/5 rounded-full bg-black/5" />
        <div className="h-5 w-3/5 rounded-full bg-black/5" />
        <div className="h-3 w-2/3 rounded-full bg-black/5" />
      </div>
    </div>
  )
}

export function SaleProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[12px] bg-white">
      <div className="h-[108px] animate-pulse bg-black/5" />
      <div className="space-y-2 px-2.5 pb-3 pt-2">
        <div className="h-4 w-full rounded-full bg-black/5" />
        <div className="h-4 w-3/4 rounded-full bg-black/5" />
        <div className="h-3 w-2/3 rounded-full bg-black/5" />
        <div className="h-4 w-1/2 rounded-full bg-black/5" />
      </div>
    </div>
  )
}
