import { Anchor, Button, Container, Paper, PasswordInput, Text, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import classes from "./login-form.module.css"
import { Link } from "@tanstack/react-router"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { z } from "zod"

const zLoginForm = z.object({
  email: z.email(),
  password: z.string(),
})

export type LoginFormValues = z.infer<typeof zLoginForm>

export interface LoginFormProps {
  loading: boolean
  onSubmit: (values: LoginFormValues) => void
}

export function LoginForm({ loading, onSubmit }: LoginFormProps) {
  const form = useForm<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: zod4Resolver(zLoginForm),
  })

  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        Welcome back!
      </Title>

      <Text className={classes.subtitle}>
        Do not have an account yet?{" "}
        <Anchor component={Link} size="sm" className={classes.link} to="/register">
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
        <form onSubmit={form.onSubmit(onSubmit)}>
          <TextInput
            key={form.key("email")}
            label="Email"
            placeholder="your_email@example.com"
            required
            radius="md"
            disabled={loading}
            type="email"
            {...form.getInputProps("email")}
          />
          <PasswordInput
            key={form.key("password")}
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            radius="md"
            disabled={loading}
            {...form.getInputProps("password")}
          />
          <Button type="submit" fullWidth mt="xl" radius="md" loading={loading} disabled={loading}>
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  )
}
