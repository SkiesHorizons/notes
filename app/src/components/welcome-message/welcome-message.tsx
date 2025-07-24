import { Group, Paper, Stack, Text, Title } from "@mantine/core"
import { IconBulb, IconFolder, IconNotebook } from "@tabler/icons-react"
import classes from "./welcome-message.module.css"

export function WelcomeMessage() {
  return (
    <Paper className={classes.welcomeCard} p="xl" radius="md" mb="xl">
      <Stack gap="md">
        <Group gap="sm">
          <IconBulb size={24} className={classes.welcomeIcon} />
          <Title order={2} className={classes.welcomeTitle}>
            Welcome to SH Notes
          </Title>
        </Group>

        <Text size="lg" c="dimmed" className={classes.welcomeSubtitle}>
          Capture your ideas, organize your thoughts, and stay productive.
        </Text>

        <Group gap="xl" mt="md">
          <Group gap="xs">
            <IconNotebook size={16} />
            <Text size="sm" c="dimmed">
              Create and edit notes
            </Text>
          </Group>
          <Group gap="xs">
            <IconFolder size={16} />
            <Text size="sm" c="dimmed">
              Organize with folders
            </Text>
          </Group>
        </Group>
      </Stack>
    </Paper>
  )
}
