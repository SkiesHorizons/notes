import { LoginForm, type LoginFormValues } from "@/components/login-form"
import { loginMutationOptions } from "@/lib/queries"
import { notifications } from "@mantine/notifications"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router"
import { z } from "zod"

export const authenticatedFallback = "/" as const

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: async ({ context, search }) => {
    if (await context.auth.isAuthenticated()) {
      throw redirect({ to: search.redirect || authenticatedFallback })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const loginMutation = useMutation({
    ...loginMutationOptions(),
    onSuccess: async (res: any) => {
      if (res.error) {
        notifications.show({
          color: "red",
          title: "Login failed",
          message: res.error.message || "An error occurred during login.",
          autoClose: 5000,
        })
        return
      }

      notifications.show({
        color: "green",
        title: "Login successful",
        message: "You have been logged in successfully.",
        autoClose: 3000,
      })

      await router.invalidate()

      await new Promise((resolve) => setTimeout(resolve, 1000))

      await navigate({ to: search.redirect || authenticatedFallback, replace: true })
    },
    onError: (err: any) => {
      notifications.show({
        color: "red",
        title: "Login failed",
        message: err?.message || "An error occurred during login.",
        autoClose: 5000,
      })
    },
  })

  const handleLogin = (values: LoginFormValues) => {
    loginMutation.mutate({
      email: values.email,
      password: values.password,
    })
  }

  return <LoginForm loading={loginMutation.isPending} onSubmit={handleLogin} />
}
