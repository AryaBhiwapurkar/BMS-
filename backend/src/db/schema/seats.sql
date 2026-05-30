CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
    seat_number TEXT NOT NULL,
    row TEXT NOT NULL,
    seat_column INTEGER NOT NULL,
    category TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(screen_id, seat_number)
);