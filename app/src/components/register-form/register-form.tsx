import { Anchor, Button, Checkbox, Container, Paper, PasswordInput, Text, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import classes from "./register-form.module.css"
import { Link } from "@tanstack/react-router"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { z } from "zod"
import { zUserRegistration } from "@/lib/api"

const zRegisterForm = zUserRegistration
  .extend({
    repeatPassword: z.string(),
    acceptTerms: z.boolean(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    path: ["repeatPassword"],
  })
  .refine((data) => data.acceptTerms, {
    path: ["acceptTerms"],
  })

export type RegisterFormValues = z.infer<typeof zRegisterForm>

export interface RegisterFormProps {
  loading: boolean
  onSubmit: (values: RegisterFormValues) => void
}

export function RegisterForm({ loading, onSubmit }: RegisterFormProps) {
  const form = useForm<RegisterFormValues>({
    initialValues: {
      username: "",
      password: "",
      repeatPassword: "",
      email: "",
      acceptTerms: false,
    },
    validate: zod4Resolver(zRegisterForm),
  })

  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        Welcome new user!
      </Title>

      <Text className={classes.subtitle}>
        Already have an account?{" "}
        <Anchor component={Link} size="sm" className={classes.link} to="/login">
          Sign in
        </Anchor>
      </Text>

      <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
        <form onSubmit={form.onSubmit(onSubmit)}>
          <TextInput
            key={form.key("username")}
            label="Username"
            placeholder="your_username"
            required
            radius="md"
            disabled={loading}
            {...form.getInputProps("username")}
          />
          {/*<TextInput
            key={form.key("name")}
            label="Name"
            placeholder="Your name"
            required
            radius="md"
            mt="md"
            disabled={loading}
            {...form.getInputProps("name")}
          />*/}
          <TextInput
            key={form.key("email")}
            label="Email"
            placeholder="you@mantine.dev"
            required
            radius="md"
            mt="md"
            disabled={loading}
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
          <PasswordInput
            key={form.key("repeatPassword")}
            label="Repeat password"
            placeholder="Repeat your password"
            required
            mt="md"
            radius="md"
            disabled={loading}
            {...form.getInputProps("repeatPassword")}
          />
          <Checkbox
            key={form.key("acceptTerms")}
            label={
              <span>
                I accept <Anchor>the terms and conditions</Anchor>
              </span>
            }
            required
            mt="md"
            disabled={loading}
            {...form.getInputProps("acceptTerms", { type: "checkbox" })}
          />
          <Button type="submit" fullWidth mt="xl" radius="md" loading={loading} disabled={loading}>
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  )
}
