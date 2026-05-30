CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    status TEXT CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    payment_method TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);