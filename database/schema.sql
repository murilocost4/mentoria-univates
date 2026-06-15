CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'ALUNO' CHECK (role IN ('ALUNO', 'MENTOR', 'ADMIN')),
    terms_accepted_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS student_profiles (
    user_id INTEGER PRIMARY KEY,
    photo_url TEXT,
    course TEXT,
    interests TEXT NOT NULL DEFAULT '[]',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mentor_profiles (
    user_id INTEGER PRIMARY KEY,
    course TEXT,
    disciplines TEXT NOT NULL DEFAULT '[]',
    availability TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'PENDENTE_APROVACAO'
        CHECK (status IN ('PENDENTE_APROVACAO', 'APROVADO', 'REPROVADO')),
    approved_by INTEGER,
    approved_at TEXT,
    average_rating REAL NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS mentorship_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    mentor_id INTEGER NOT NULL,
    discipline TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'PENDENTE'
        CHECK (status IN ('PENDENTE', 'ACEITA', 'RECUSADA')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (mentor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS mentorships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL UNIQUE,
    scheduled_at TEXT,
    status TEXT NOT NULL DEFAULT 'ACEITA'
        CHECK (status IN ('PENDENTE', 'ACEITA', 'AGENDADA', 'CANCELADA', 'CONCLUIDA')),
    type TEXT CHECK (type IN ('ONLINE', 'PRESENCIAL')),
    meeting_link TEXT,
    location TEXT,
    cancelled_by INTEGER,
    cancel_reason TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (request_id) REFERENCES mentorship_requests(id),
    FOREIGN KEY (cancelled_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mentorship_id INTEGER NOT NULL UNIQUE,
    student_id INTEGER NOT NULL,
    mentor_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (mentorship_id) REFERENCES mentorships(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (mentor_id) REFERENCES users(id)
);
