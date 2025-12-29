-- migrate:up
alter table colors add column if not exists disable_color_scheme boolean default false;

-- migrate:down
alter table colors drop column disable_color_scheme;
