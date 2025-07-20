import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { AppLayout } from "@/components/app-layout"

export const Route = createFileRoute("/(app)")({
  beforeLoad: async ({
    context: {
      auth: { isAuthenticated },
    },
    location,
  }) => {
    if (!(await isAuthenticated())) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
