#!/bin/bash
#---
# Excerpted from "Practical Microservices",
# published by The Pragmatic Bookshelf.
# Copyrights apply to this code. It may not be used to create training material,
# courses, books, articles, and the like. Contact us if you are in doubt.
# We make no guarantees that this code is fit for any purpose.
# Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
#---

# Modified from:
# https://hub.docker.com/_/postgres/
set -e

echo $POSTGRES_USER
echo $POSTGRES_DB

psql -v ON_ERROR_STOP=1 -v VERBOSITY=verbose --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE practical_microservices_test;
  \c practical_microservices_test

  GRANT ALL PRIVILEGES ON DATABASE practical_microservices_test TO practical_microservices;
  ALTER DEFAULT PRIVILEGES FOR ROLE practical_microservices IN SCHEMA PUBLIC GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO practical_microservices;
  ALTER DEFAULT PRIVILEGES FOR ROLE practical_microservices IN SCHEMA PUBLIC GRANT EXECUTE ON FUNCTIONS TO practical_microservices;
EOSQL
