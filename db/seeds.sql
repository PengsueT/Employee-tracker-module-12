INSERT INTO department (name)
VALUES 
('Sales'),
('Engineering'),
('HR'),
('Customer Service'),
('Finance'),
('Legal');

INSERT INTO role (title, salary, department_id) 
VALUES 
('Salesperson', 60000, 1),
('Software Engineer', 85000, 2),
('HR Specialist', 85000, 3),
('Senior Software Engineer', 110000, 2),
('Customer Service Manager', 75000, 4),
('Customer Service', 55000, 4),
('Accountant Manager', 110000, 5),
('Accountant', 90000, 5),
('Sales Lead', 80000, 1),
('Legal Lead', 150000, 6),
('Lawyer', 120000, 6);



INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Khais', 'Yang', 1, 5),
('Sue', 'Thao', 2, 3),
('Danny', 'Yang', 4, NULL),
('Paz', 'Lee', 3, NULL),
('Long', 'Thao', 9, NULL),
('Sabrina', 'Lee', 7, NULL),
('Tommy', 'Lee', 5, NULL),
('Anna', 'Lee', 6, 7),
('Suabnag', 'Lee', 8, 6),
('Christy', 'Her', 10, NULL),
('Yee', 'Chou', 11, 10);

SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;