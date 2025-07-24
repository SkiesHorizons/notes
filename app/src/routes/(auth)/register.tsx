import { RegisterForm, type RegisterFormValues } from "@/components/register-form"
import { registerMutationOptions } from "@/lib/queries"
import { authenticatedFallback } from "@/routes/(auth)/login"
import { notifications } from "@mantine/notifications"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/(auth)/register")({
  beforeLoad: async ({ context }) => {
    if (await context.auth.isAuthenticated()) {
      throw redirect({
        to: authenticatedFallback,
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const registerMutation = useMutation({
    ...registerMutationOptions(),
    onSuccess: async () => {
      notifications.show({
        color: "green",
        title: "Registration successful",
        message: "Your account has been created.",
        autoClose: 3000,
      })
      await navigate({ to: "/login", replace: true })
    },
    onError: (error: any) => {
      notifications.show({
        color: "red",
        title: "Registration failed",
        message: error?.message || "An error occurred during registration.",
        autoClose: 5000,
      })
      console.error(error)
    },
  })

  const handleRegister = (values: RegisterFormValues) => {
    registerMutation.mutate({
      email: values.email,
      password: values.password,
    })
  }

  return <RegisterForm loading={registerMutation.isPending} onSubmit={handleRegister} />
}
