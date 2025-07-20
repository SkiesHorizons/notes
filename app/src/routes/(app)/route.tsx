import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { AppLayout } from "@/components/app-layout"

export const Route = createFileRoute("/(app)")({
  beforeLoad: ({
    context: {
      auth: { isAuthenticated },
    },
  }) => {
    if (!isAuthenticated()) {
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
