-- migration: create note folders table and update notes table
-- purpose: implement folder organization for notes with tree structure
-- affected tables: notes (add folder_id column), note_folders (new table)
-- maximum folder depth: 5 levels

-- create note_folders table to organize notes in hierarchical structure
create table note_folders
(
    id         uuid                        not null default gen_random_uuid(),
    user_id    uuid                        not null,
    name       varchar(256)                not null,
    parent_id  uuid,
    depth      integer                     not null default 0,
    created_at timestamp without time zone not null default now(),
    updated_at timestamp without time zone not null default now(),
    deleted_at timestamp without time zone,
    constraint pk_note_folders primary key (id),
    -- ensure maximum depth of 5 levels (0-based indexing: 0, 1, 2, 3, 4)
    constraint chk_note_folders_max_depth check (depth >= 0 and depth <= 4),
    -- ensure folder names are not empty
    constraint chk_note_folders_name_not_empty check (length(trim(name)) > 0)
);

-- add foreign key constraint to link folders to users
alter table note_folders
    add constraint fk_note_folders_user_id_on_users foreign key (user_id) references auth.users (id) on delete cascade;

-- add self-referencing foreign key for parent-child relationship
alter table note_folders
    add constraint fk_note_folders_parent_id_on_note_folders foreign key (parent_id) references note_folders (id) on delete cascade;

-- add indexes for performance optimization
create index idx_note_folders_user_id on note_folders (user_id);
create index idx_note_folders_parent_id on note_folders (parent_id);
create index idx_note_folders_user_parent on note_folders (user_id, parent_id);

-- add folder_id column to notes table to link notes to folders
alter table notes
    add column folder_id uuid;

-- add foreign key constraint to link notes to folders
alter table notes
    add constraint fk_notes_folder_id_on_note_folders foreign key (folder_id) references note_folders (id) on delete set null;

-- add index for notes folder lookups
create index idx_notes_folder_id on notes (folder_id);

-- enable row level security on note_folders table
alter table note_folders
    enable row level security;

-- rls policy: allow authenticated users to select (view) their own folders
create policy "Authenticated users can view their own folders"
    on note_folders
    for select
    to authenticated
    using (user_id = (select auth.uid()));

-- rls policy: allow authenticated users to insert folders for themselves
create policy "Authenticated users can create their own folders"
    on note_folders
    for insert
    to authenticated
    with check (user_id = (select auth.uid()));

-- rls policy: allow authenticated users to update their own folders
create policy "Authenticated users can update their own folders"
    on note_folders
    for update
    to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));

-- rls policy: allow authenticated users to delete their own folders
create policy "Authenticated users can delete their own folders"
    on note_folders
    for delete
    to authenticated
    using (user_id = (select auth.uid()));

-- create function to automatically calculate folder depth
create or replace function calculate_folder_depth()
    returns trigger
    language plpgsql
    security invoker
    set search_path = ''
as
$$
begin
    -- if no parent, depth is 0 (root folder)
    if new.parent_id is null then
        new.depth := 0;
    else
        -- get parent depth and add 1
        select depth + 1
        into new.depth
        from note_folders
        where id = new.parent_id
          and user_id = new.user_id;

        -- ensure depth doesn't exceed maximum of 4 (0-based)
        if new.depth > 4 then
            raise exception 'Maximum folder depth of 5 levels exceeded';
        end if;
    end if;

    return new;
end;
$$;

-- create trigger to automatically set folder depth on insert/update
create trigger trigger_calculate_folder_depth
    before insert or update
    on note_folders
    for each row
execute function calculate_folder_depth();

-- create function to prevent circular references in folder hierarchy
create or replace function prevent_circular_folder_reference()
    returns trigger
    language plpgsql
    security invoker
    set search_path = ''
as
$$
begin
    -- check if the new parent_id would create a circular reference
    if new.parent_id is not null then
        -- use recursive cte to check for circular reference
        with recursive folder_path as (
            -- start with the proposed parent
            select id, parent_id, 1 as level
            from note_folders
            where id = new.parent_id
              and user_id = new.user_id

            union all

            -- recursively follow parent chain
            select nf.id, nf.parent_id, fp.level + 1
            from note_folders nf
                     inner join folder_path fp on nf.id = fp.parent_id
            where fp.level < 10 -- prevent infinite recursion
        )
        select 1
        into strict new.depth
        from folder_path
        where id = new.id
        limit 1;

        -- if we found the current folder in its own parent chain, it's circular
        if found then
            raise exception 'Circular reference detected in folder hierarchy';
        end if;
    end if;

    return new;
exception
    when no_data_found then
        -- no circular reference found, proceed normally
        return new;
end;
$$;

-- create trigger to prevent circular references
create trigger trigger_prevent_circular_folder_reference
    before insert or update
    on note_folders
    for each row
execute function prevent_circular_folder_reference();