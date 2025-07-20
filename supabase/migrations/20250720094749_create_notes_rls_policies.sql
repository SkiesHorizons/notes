-- Enable Row Level Security (RLS) on the notes table
alter table notes
    enable row level security;

-- Allow authenticated users to select (view) their own notes
create policy "Authenticated users can view their own notes"
    on notes
    for select
    to authenticated
    using (user_id = (select auth.uid()));

-- Allow authenticated users to insert notes for themselves
create policy "Authenticated users can create their own notes"
    on notes
    for insert
    to authenticated
    with check (user_id = (select auth.uid()));

-- Allow authenticated users to update their own notes
create policy "Authenticated users can update their own notes"
    on notes
    for update
    to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));

-- Allow authenticated users to delete their own notes
create policy "Authenticated users can delete their own notes"
    on notes
    for delete
    to authenticated
    using (user_id = (select auth.uid()));