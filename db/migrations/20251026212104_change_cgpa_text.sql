-- migrate:up
alter table education alter column cgpa type text;

-- migrate:down

