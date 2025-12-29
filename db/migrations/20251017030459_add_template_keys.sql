-- migrate:up
create table template_keys (
	id serial primary key,
	key text not null,
	file_name text not null
);

insert into template_keys (key, file_name) values 
('GbSPaBFr', 'Nova'),
('uYkJhyRn', 'Nebula'),
('XFtSwkva', 'Astra'),
('FbegNBEm', 'Orion'),
('TnpaLjip', 'Titan'),
('BzGQHqTm', 'Zenith');

-- migrate:down
drop table template_keys;