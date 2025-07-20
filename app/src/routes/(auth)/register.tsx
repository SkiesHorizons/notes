import { createFileRoute, redirect } from "@tanstack/react-router"
import { RegisterForm, type RegisterFormValues } from "@/components/register-form"
import { useRegisterMutation } from "@/hooks/api"
import { notifications } from "@mantine/notifications"
import { authenticatedFallback } from "@/routes/(auth)/login"

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
  const registerMutation = useRegisterMutation({
    onSuccess: async () => {
      notifications.show({
        color: "green",
        title: "Registration successful",
        message: "Your account has been created.",
        autoClose: 3000,
      })
      await navigate({ to: "/login", replace: true })
    },
    onError: (error) => {
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
