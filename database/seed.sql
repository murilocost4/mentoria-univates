INSERT INTO users (email, name, role) VALUES
    ('admin@universo.univates.br', 'Administrador', 'ADMIN'),
    ('aluno@universo.univates.br', 'João Aluno', 'ALUNO'),
    ('mentor.aprovado@universo.univates.br', 'Maria Mentor', 'MENTOR'),
    ('mentor.pendente@universo.univates.br', 'Pedro Pendente', 'MENTOR');

INSERT INTO student_profiles (user_id, course, interests) VALUES
    (2, 'Ciência da Computação', '["Algoritmos","Banco de Dados"]');

INSERT INTO mentor_profiles (user_id, course, disciplines, availability, status, approved_by, approved_at, average_rating, review_count) VALUES
    (3, 'Ciência da Computação', '["Algoritmos","Estruturas de Dados","Banco de Dados"]', '{"segunda":["14:00-16:00"],"quarta":["10:00-12:00"]}', 'APROVADO', 1, datetime('now'), 4.5, 2),
    (4, 'Engenharia de Software', '["POO","Testes de Software"]', '{"terca":["18:00-20:00"]}', 'PENDENTE_APROVACAO', NULL, NULL, 0, 0);
