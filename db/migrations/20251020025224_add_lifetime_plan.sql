-- migrate:up
alter table users add column is_lifetime_plan boolean default false;

-- migrate:down
alter table users drop column is_lifetime_plan;
