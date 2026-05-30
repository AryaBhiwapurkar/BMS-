CREATE TABLE movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL,
    duration INTEGER NOT NULL CHECK (duration > 0),
    language TEXT NOT NULL,
    genre TEXT,

    release_date DATE NOT NULL,

    certification TEXT 
        CHECK (certification IN ('U', 'U/A', 'A')),

    description TEXT,
    poster_url TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);