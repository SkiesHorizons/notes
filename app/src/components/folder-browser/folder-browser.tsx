import { useCreateFolderMutation, useDeleteFolderMutation, useListFoldersQuery, usePatchFolderMutation } from '@/hooks/api';
import type { NoteFolderCreate, NoteFolderPatch, NoteFolderTree } from '@/lib/models';
import { ActionIcon, Box, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconChevronRight, IconEdit, IconFolder, IconFolderPlus, IconNote, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import classes from './folder-browser.module.css';

interface FolderBrowserProps {
  selectedFolderId?: string | null;
  onFolderSelect: (folderId: string | null) => void;
}

interface FolderModalProps {
  folder?: NoteFolderTree;
  parentFolder?: NoteFolderTree;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FolderItemProps {
  folder: NoteFolderTree;
  selectedFolderId?: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onEdit: (folder: NoteFolderTree) => void;
  onDelete: (folder: NoteFolderTree) => void;
  onCreate: (parent: NoteFolderTree) => void;
  expandedFolders: Set<string>;
  onToggleExpand: (folderId: string) => void;
}

function FolderItem({ 
  folder, 
  selectedFolderId, 
  onFolderSelect, 
  onEdit, 
  onDelete, 
  onCreate, 
  expandedFolders,
  onToggleExpand 
}: FolderItemProps) {
  const isExpanded = expandedFolders.has(folder.id);
  const hasChildren = folder.children.length > 0;

  return (
    <Box>
      <Box
        className={`${classes.folderItem} ${selectedFolderId === folder.id ? classes.selected : ''}`}
        style={{ paddingLeft: `${folder.depth * 16 + 8}px` }}
      >
        <Group justify="space-between" w="100%">
          <Group 
            gap="xs" 
            onClick={() => onFolderSelect(folder.id)}
            style={{ cursor: 'pointer', flex: 1 }}
          >
            {hasChildren ? (
              <ActionIcon
                variant="transparent"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(folder.id);
                }}
              >
                {isExpanded ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
              </ActionIcon>
            ) : (
              <Box w="xs" />
            )}
            <IconFolder size={16} />
            <Text size="sm">{folder.name}</Text>
            {folder.noteCount > 0 && (
              <Text size="xs" c="dimmed">
                ({folder.noteCount})
              </Text>
            )}
          </Group>
          <Group gap={2} className={classes.folderActions}>
            <ActionIcon
              variant="subtle"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onCreate(folder);
              }}
              disabled={folder.depth >= 4}
              title={folder.depth >= 4 ? 'Maximum folder depth reached' : 'Create subfolder'}
            >
              <IconFolderPlus size={12} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(folder);
              }}
            >
              <IconEdit size={12} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="xs"
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(folder);
              }}
            >
              <IconTrash size={12} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>
      
      {hasChildren && isExpanded && (
        <Box>
          {folder.children.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              selectedFolderId={selectedFolderId}
              onFolderSelect={onFolderSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreate={onCreate}
              expandedFolders={expandedFolders}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

function FolderModal({ folder, parentFolder, isOpen, onClose, onSuccess }: FolderModalProps) {
  const [name, setName] = useState(folder?.name || '');
  const createFolderMutation = useCreateFolderMutation();
  const patchFolderMutation = usePatchFolderMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (folder) {
        // Edit existing folder
        await patchFolderMutation.mutateAsync({
          folderId: folder.id,
          data: { name: name.trim() } as NoteFolderPatch,
        });
      } else {
        // Create new folder
        await createFolderMutation.mutateAsync({
          name: name.trim(),
          parentId: parentFolder?.id,
        } as NoteFolderCreate);
      }
      onSuccess();
      onClose();
      setName('');
    } catch (error) {
      console.error('Error saving folder:', error);
    }
  };

  const isLoading = createFolderMutation.isPending || patchFolderMutation.isPending;

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={folder ? 'Edit Folder' : 'Create Folder'}
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {parentFolder && (
            <Text size="sm" c="dimmed">
              Parent folder: {parentFolder.name}
            </Text>
          )}
          <TextInput
            label="Folder name"
            placeholder="Enter folder name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
            autoFocus
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              {folder ? 'Save' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export function FolderBrowser({ selectedFolderId, onFolderSelect }: FolderBrowserProps) {
  const { data: folders = [], refetch } = useListFoldersQuery();
  const deleteFolderMutation = useDeleteFolderMutation();
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingFolder, setEditingFolder] = useState<NoteFolderTree | undefined>();
  const [parentFolder, setParentFolder] = useState<NoteFolderTree | undefined>();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const handleCreateFolder = (parent?: NoteFolderTree) => {
    setEditingFolder(undefined);
    setParentFolder(parent);
    openModal();
  };

  const handleEditFolder = (folder: NoteFolderTree) => {
    setEditingFolder(folder);
    setParentFolder(undefined);
    openModal();
  };

  const handleDeleteFolder = async (folder: NoteFolderTree) => {
    if (confirm(`Are you sure you want to delete "${folder.name}"? This will move all notes in this folder to the root.`)) {
      try {
        await deleteFolderMutation.mutateAsync({ folderId: folder.id });
        if (selectedFolderId === folder.id) {
          onFolderSelect(null);
        }
        refetch();
      } catch (error) {
        console.error('Error deleting folder:', error);
      }
    }
  };

  const handleModalSuccess = () => {
    refetch();
  };

  const handleToggleExpand = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <Text fw={600} size="sm">Folders</Text>
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={() => handleCreateFolder()}
          title="Create new folder"
        >
          <IconFolderPlus size={16} />
        </ActionIcon>
      </Group>

      <Box className={classes.folderBrowser} p="xs">
        <Stack gap="xs">
          {/* Root folder (All Notes) */}
          <Box
            className={`${classes.folderItem} ${selectedFolderId === null ? classes.selected : ''}`}
            onClick={() => onFolderSelect(null)}
          >
            <Group gap="xs">
              <IconNote size={16} />
              <Text size="sm">All Notes</Text>
            </Group>
          </Box>

          {/* Folder tree */}
          {folders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              selectedFolderId={selectedFolderId}
              onFolderSelect={onFolderSelect}
              onEdit={handleEditFolder}
              onDelete={handleDeleteFolder}
              onCreate={handleCreateFolder}
              expandedFolders={expandedFolders}
              onToggleExpand={handleToggleExpand}
            />
          ))}

          {folders.length === 0 && (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No folders yet. Create your first folder to organize your notes.
            </Text>
          )}
        </Stack>
      </Box>

      <FolderModal
        folder={editingFolder}
        parentFolder={parentFolder}
        isOpen={modalOpened}
        onClose={closeModal}
        onSuccess={handleModalSuccess}
      />
    </Box>
  );
}
