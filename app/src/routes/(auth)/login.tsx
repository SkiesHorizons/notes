import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { LoginForm, type LoginFormValues } from "@/components/login-form"
import { useLoginMutation } from "@/hooks/api"
import useSignIn from "react-auth-kit/hooks/useSignIn"
import { notifications } from "@mantine/notifications"
import { getCurrentUser } from "@/lib/api"

export const authenticatedFallback = "/" as const

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated()) {
      throw redirect({ to: search.redirect || authenticatedFallback })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const signIn = useSignIn()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const loginMutation = useLoginMutation({
    onSuccess: async ({ accessToken }) => {
      const { data: user } = await getCurrentUser()
      signIn({
        auth: {
          token: accessToken,
        },
        userState: user,
      })
      await navigate({ to: search.redirect || authenticatedFallback, replace: true })
    },
    onError: (err) => {
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
      body: {
        username: values.username,
        password: values.password,
      },
    })
  }

  return <LoginForm loading={loginMutation.isPending} onSubmit={handleLogin} />
}
