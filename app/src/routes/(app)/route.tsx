import { AppLayout } from "@/components/app-layout"
import { NoteEditorModal } from "@/components/note-editor-modal"
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { FolderEditModal } from "@/components/folder-edit-modal"

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
      <NoteEditorModal />
      <FolderEditModal />
    </AppLayout>
  )
}
