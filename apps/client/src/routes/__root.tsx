import {
  Asset,
  Scripts,
  createRootRoute,
  useRouter,
  useTags,
} from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'

import '../styles/app.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'deploy-flow client',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head suppressHydrationWarning><RootHeadContent /></head>
      <body suppressHydrationWarning><NuqsAdapter>{children}</NuqsAdapter><Scripts /></body>
    </html>
  )
}

function RootHeadContent() {
  const tags = useTags()
  const router = useRouter()
  const nonce = router.options.ssr?.nonce

  return (
    <>
      {tags
        .filter((tag) => {
          if (tag.tag !== 'link') {
            return true
          }

          const href =
            typeof tag.attrs?.href === 'string' ? tag.attrs.href : undefined
          const rel =
            typeof tag.attrs?.rel === 'string' ? tag.attrs.rel : undefined

          return !(
            href?.startsWith('/assets/') &&
            (rel === 'stylesheet' || rel === 'modulepreload')
          )
        })
        .map((tag) => (
          <Asset {...tag} key={`tsr-meta-${JSON.stringify(tag)}`} nonce={nonce} />
        ))}
    </>
  )
}
