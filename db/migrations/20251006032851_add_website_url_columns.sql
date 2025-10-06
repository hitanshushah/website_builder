-- migrate:up
alter table profiles add column website_url text;
alter table profiles add column personal_website_url text;
alter table profiles add column share_website boolean default false;
alter table profiles add column share_personal_website boolean default false;
alter table profiles add column acess_token text unique;

alter table profiles add constraint chk_share_only_one 
check (not (share_website = true and share_personal_website = true));

alter table users add column website_premium boolean default false;
-- migrate:down
alter table profiles drop constraint if exists chk_share_only_one;
alter table profiles drop column website_url;
alter table profiles drop column personal_website_url;
alter table profiles drop column share_website;
alter table profiles drop column share_personal_website;
alter table profiles drop column acess_token;
alter table users drop column website_premium;