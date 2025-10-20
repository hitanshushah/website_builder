-- migrate:up
alter table profiles add column domain_verified boolean default false;
alter table profiles add column domain_key text unique;
alter table profiles add column domain_value text unique;

-- migrate:down
alter table profiles drop column domain_verified;
alter table profiles drop column domain_key;
alter table profiles drop column domain_value;
