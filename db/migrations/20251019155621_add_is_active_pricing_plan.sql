-- migrate:up
alter table premium_plans add column is_active boolean default true;

update premium_plans set is_active = false where key = 'plus';
-- migrate:down
alter table premium_plans drop column is_active;
