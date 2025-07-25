-- Returns a note_folders row with a computed path array (id, name, depth) from root to the folder
create or replace function public.get_folder_with_path(folder_id uuid)
    returns table
            (
                id         uuid,
                user_id    uuid,
                name       varchar(256),
                parent_id  uuid,
                depth      integer,
                created_at timestamp without time zone,
                updated_at timestamp without time zone,
                deleted_at timestamp without time zone,
                path       jsonb
            )
    language plpgsql
    security invoker
    set search_path = ''
as
$$
begin
    return query
        with recursive folder_path as
                           (select f1.id, f1.name, f1.parent_id, f1.depth
                            from public.note_folders f1
                            where f1.id = folder_id
                            union all
                            select f2.id, f2.name, f2.parent_id, f2.depth
                            from public.note_folders f2
                                     join folder_path fp on f2.id = fp.parent_id)
        select nf.id,
               nf.user_id,
               nf.name,
               nf.parent_id,
               nf.depth,
               nf.created_at,
               nf.updated_at,
               nf.deleted_at,
               (select jsonb_agg(jsonb_build_object('id', fp.id, 'name', fp.name, 'depth', fp.depth) order by fp.depth)
                from folder_path fp) as path
        from public.note_folders nf
        where nf.id = folder_id;
end;
$$;
