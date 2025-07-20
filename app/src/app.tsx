import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import "@mantine/notifications/styles.css"

import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { routeTree } from "./routeTree.gen"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import createStore from "react-auth-kit/createStore"
import AuthProvider from "react-auth-kit"
import type { User } from "@/lib/types"
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated"
import { client } from "@/lib/api"

// Create a client
const queryClient = new QueryClient()

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient: queryClient,
    auth: undefined!,
  },
  defaultPreload: "intent",
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const authStore = createStore<User>({
  authType: "localstorage",
  authName: "notes_auth",
})

client.setConfig({
  auth: () => authStore.tokenObject.value.auth?.token,
})

function InnerApp() {
  const isAuthenticated = useIsAuthenticated()

  return (
    <RouterProvider
      router={router}
      context={{
        auth: {
          isAuthenticated: () => isAuthenticated,
        },
      }}
    />
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Notifications />
        <ModalsProvider>
          <AuthProvider store={authStore}>
            <InnerApp />
          </AuthProvider>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}
