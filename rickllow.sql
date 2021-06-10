\echo 'Delete and recreate rickllow db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE rickllow;
CREATE DATABASE rickllow;
\connect rickllow

\i rickllow-schema.sql
\i rickllow-seed.sql