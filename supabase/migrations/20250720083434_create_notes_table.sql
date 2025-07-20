create table notes
(
    id         uuid                        not null default gen_random_uuid(),
    user_id    uuid                        not null,
    title      varchar(256),
    content    text                        not null,
    created_at timestamp without time zone not null default now(),
    updated_at timestamp without time zone not null default now(),
    deleted_at timestamp without time zone,
    constraint pk_notes primary key (id)
);

-- Add foreign key constraint to link notes to users
alter table notes
    add constraint fk_notes_user_id_on_users foreign key (user_id) references auth.users (id) on delete cascade;

-- Add index for faster lookups on user_id
create index idx_notes_user_id on notes (user_id);
