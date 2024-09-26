-- Creating database and if it exists to drop it.
DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

-- To access employee_db database
\c employee_db;

-- Creating table called department that has a primary id key, and a name.
CREATE TABLE department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL -- to hold department name
);

-- Creating a table called role with id, title, salary, and department_id as well as a FOREIGN KEY related to the department id.
CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INTEGER NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department (id)
);

-- Creating a table called employee with id, first_name, last_name, role_id, and manager_id along with two FOREIGN KEYS with role and employee id.
CREATE TABLE employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER NOT NULL,
    manager_id INTEGER,
    FOREIGN KEY (role_id) REFERENCES role (id),
    FOREIGN KEY (manager_id) REFERENCES employee (id)
);