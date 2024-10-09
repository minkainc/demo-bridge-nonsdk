CREATE TABLE "entries" (
    "handle" character varying NOT NULL,
    "hash" character varying NOT NULL,
    "data" jsonb NOT NULL,
    "meta" jsonb NOT NULL,
    "schema" character varying NULL,
    "account" character varying NULL,
    "symbol" character varying NULL,
    "amount" DECIMAL(19,2) NULL,
    "state" character varying NULL,
    "previousState" character varying NULL,
    "actions" jsonb NOT NULL,
    "processingAction" character varying NULL,
    "processingStart" TIMESTAMP WITHOUT TIME ZONE NULL,
    "created" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    CONSTRAINT "pk_entries_handle" PRIMARY KEY ("handle")
);

CREATE TABLE "intents" (
    "handle" character varying NOT NULL,
    "hash" character varying NOT NULL,
    "data" jsonb NOT NULL,
    "meta" jsonb NOT NULL,
    "created" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    CONSTRAINT "pk_intents_handle" PRIMARY KEY ("handle")
);