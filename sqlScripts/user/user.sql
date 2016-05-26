create table  if not exists  USER (
    id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
    name TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    role  TEXT
)
<!--GO-->
insert OR IGNORE into user (name,email,password,role) values ('admin', 'admin@admin',  'admin', 'admin')