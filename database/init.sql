-- Connect to the database (already created by POSTGRES_DB env var)
\c taskgrid_db;

-- Create employees table
CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    work_start_time TIME NOT NULL,
    work_end_time TIME NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tickets table
CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    employee_id BIGINT REFERENCES employees(id) ON DELETE SET NULL,
    scheduled_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_tickets_employee_id ON tickets(employee_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_employees_email ON employees(email);

-- Insert test employees
INSERT INTO employees (name, email, password, work_start_time, work_end_time, active)
VALUES 
(
    'Иван Петров',
    'ivan@example.com',
    '$2a$10$VxFrW.hzJ.5wX2kLKh5nueEzgDjKdxm/KhPzJJfpRXJ1gN9vQfKum',
    '09:00',
    '18:00',
    true
),
(
    'Мария Сидорова',
    'maria@example.com',
    '$2a$10$VxFrW.hzJ.5wX2kLKh5nueEzgDjKdxm/KhPzJJfpRXJ1gN9vQfKum',
    '10:00',
    '19:00',
    true
),
(
    'Пётр Иванов',
    'petr@example.com',
    '$2a$10$VxFrW.hzJ.5wX2kLKh5nueEzgDjKdxm/KhPzJJfpRXJ1gN9vQfKum',
    '08:00',
    '17:00',
    true
),
(
    'Елена Соколова',
    'elena@example.com',
    '$2a$10$VxFrW.hzJ.5wX2kLKh5nueEzgDjKdxm/KhPzJJfpRXJ1gN9vQfKum',
    '09:00',
    '18:00',
    true
);

-- Password for all test employees: password123

-- Grant privileges to taskgrid_user
GRANT ALL PRIVILEGES ON DATABASE taskgrid_db TO taskgrid_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO taskgrid_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO taskgrid_user;
