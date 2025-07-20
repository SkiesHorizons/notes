import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type { QueryClient } from "@tanstack/react-query"

interface RootRouterContext {
  queryClient: QueryClient
  auth: {
    isAuthenticated: () => boolean
  }
}

export const Route = createRootRouteWithContext<RootRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
