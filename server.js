const express = require('express');
const inquirer = require('inquirer');
const { Pool } = require('pg');
require('dotenv').config();

// Setting up express server
const app = express();
const PORT = process.env.PORT || 3001;


// Middleware to handle URL encode data and JSON request
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to the employee database
const pool = new Pool(
    {
        user: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        host: 'localhost',
        database: 'employee_db'
    },
    console.log(`Connected to the database!`)
);

pool.connect()
    .catch(err => console.error("Couldn't connect to database"));

// starting the express server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// function for the command-line app
async function employeeApp() {
    // Menu option for the CLI
    const choices = [
        'View All Employees',
        'View All Roles',
        'View All Departments',
        'Add Employee',
        'Add Role',
        'Add Department',
        'Update Employee Role',
        'Update Employee Manager',
        'View Employees By Manager',
        'View Employees By Department',
        'Delete a Employee',
        'Delete a Role',
        'Delete a Department',
        'View Total Budget By Department',
        'Quit'
    ];

    // Prompting the user with menu
    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Please select an option',
            choices: choices
        }
    ]);

    // this will handle user choice based on the selected option
    switch (answer.choice) {
        case 'View All Employees':
            await viewAllEmployees();
            break;
        case 'View All Roles':
            await viewAllRoles();
            break;
        case 'View All Departments':
            await viewAllDepartments();
            break;
        case 'Add Employee':
            await addEmployee();
            break;
        case 'Add Role':
            await addRole();
            break;
        case 'Add Department':
            await addDepartment();
            break;
        case 'Update Employee Role':
            await updateEmployeeRole();
            break;
        case 'Update Employee Manager':
            await updateEmployeeManager();
            break;
        case 'View Employees By Manager':
            await viewEmployeesByManager();
            break;
        case 'View Employees By Department':
            await viewEmployeesByDepartment();
            break;
        case 'Delete a Employee':
            await deleteEmployee();
            break;
        case 'Delete a Role':
            await deleteRole();
            break;
        case 'Delete a Department':
            await deleteDepartment();
            break;
        case 'View Total Budget By Department':
            await viewTotalBudgetByDepartment();
            break;
        case 'Quit':
            await pool.end(); // we want to close PostgreSQL pool when quitting
            console.log('Exiting the program...');
            process.exit(0);
        default:
            console.log('Invalid choice, please try again.');
            employeeApp(); // go back to employee menu
    }
}

// function to view all employees
function viewAllEmployees() {
    // Getting information from database using query
    pool.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name,' ', manager.last_name) AS manager
        FROM employee 
        INNER JOIN role ON employee.role_id = role.id 
        INNER JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON employee.manager_id = manager.id`, function (err, result) {
        if (err) {
            console.error('Error executing query:', err);
            return;
        }
        console.table(result.rows);
        employeeApp();
    })
}

// function to view all roles
async function viewAllRoles() {
    try {
        const result = await pool.query(`
            SELECT role.id, role.title, department.name AS department, role.salary
            FROM role
            INNER JOIN department ON role.department_id = department.id
        `);
        console.table(result.rows);
    } catch (err) {
        console.error('Error executing query:', err);
    }
    employeeApp();
}

// function to view all departments
async function viewAllDepartments() {
    try {
        const result = await pool.query(`SELECT * FROM department`);
        console.table(result.rows);
    } catch (err) {
        console.error('Error executing query:', err);
    }
    employeeApp();
}

// function to add a new employee
async function addEmployee() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'Enter the employee first name:'
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Enter the employee last name:'
        },
        {
            type: 'input',
            name: 'roleId',
            message: 'Enter the role ID for this employee:'
        },
        {
            type: 'input',
            name: 'managerId',
            message: 'Enter the manager ID for this employee (or leave blank if none):',
            default: null
        }
    ]);

    try {
        // Inserting new employee into the database
        await pool.query(`
            INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES ($1, $2, $3, $4)`, [answers.firstName, answers.lastName, answers.roleId, answers.managerId || null]);
        console.log(`Employee '${answers.firstName} ${answers.lastName}' added successfully!`);
    } catch (err) {
        console.error('Error adding employee:', err);
    }
    employeeApp();
}

// funciton to add a new role
async function addRole() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'roleTitle',
            message: 'Enter the role title:'
        },
        {
            type: 'input',
            name: 'roleSalary',
            message: 'Enter the salary for the role:'
        },
        {
            type: 'input',
            name: 'departmentId',
            message: 'Enter the department ID for this role:'
        }
    ]);

    try {
        // Inserting new role into the database
        await pool.query(`
            INSERT INTO role (title, salary, department_id)
            VALUES ($1, $2, $3)`, [answers.roleTitle, answers.roleSalary, answers.departmentId]);
        console.log(`Role '${answers.roleTitle}' added successfully!`);
    } catch (err) {
        console.error('Error adding role:', err);
    }
    employeeApp();
}

// function to add new department
async function addDepartment() {
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: 'Enter the name of the new department:'
        }
    ]);

    try {
        // Inserting new department into the database
        await pool.query('INSERT INTO department (name) VALUES ($1)', [answer.departmentName]);
        console.log(`Department '${answer.departmentName}' added successfully!`);
    } catch (err) {
        console.error('Error adding department:', err);
    }
    employeeApp();
}

// function to update employee role
async function updateEmployeeRole() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'employeeId',
            message: 'Enter the employee ID you want to update:'
        },
        {
            type: 'input',
            name: 'newRoleId',
            message: 'Enter the new role ID for the employee:'
        }
    ]);

    try {
        // Updating the employee's role in the database
        await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [answers.newRoleId, answers.employeeId]);
        console.log(`Employee ID ${answers.employeeId} role updated to Role ID ${answers.newRoleId}`);
    } catch (err) {
        console.error('Error updating employee role:', err);
    }
    employeeApp();
}

// function to update employee manager
async function updateEmployeeManager() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'employeeId',
            message: 'Enter the employee ID you want to update the manager for:'
        },
        {
            type: 'input',
            name: 'managerId',
            message: 'Enter the new manager ID:'
        }
    ]);

    try {
        await pool.query('UPDATE employee SET manager_id = $1 WHERE id = $2', [answers.managerId, answers.employeeId]);
        console.log(`Employee ID ${answers.employeeId}'s manager updated to Manager ID ${answers.managerId}`);
    } catch (err) {
        console.error('Error updating employee manager:', err);
    }
    employeeApp();
}

// function to view employee by manager
async function viewEmployeesByManager() {
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'managerId',
            message: 'Enter the Manager ID to view their employees:'
        }
    ]);

    try {
        const result = await pool.query(`
            SELECT id, first_name, last_name FROM employee WHERE manager_id = $1
        `, [answer.managerId]);

        console.table(result.rows);
    } catch (err) {
        console.error('Error viewing employees by manager:', err);
    }
    employeeApp();
}

// function to view employee by department
async function viewEmployeesByDepartment() {
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'departmentId',
            message: 'Enter the Department ID to view employees:'
        }
    ]);

    try {
        const result = await pool.query(`
            SELECT employee.id, employee.first_name, employee.last_name, role.title 
            FROM employee 
            JOIN role ON employee.role_id = role.id 
            WHERE role.department_id = $1
        `, [answer.departmentId]);

        console.table(result.rows);
    } catch (err) {
        console.error('Error viewing employees by department:', err);
    }
    employeeApp();
}

// function to delete an employee
async function deleteEmployee() {
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'employeeId',
            message: 'Enter the Employee ID to delete:'
        }
    ]);

    try {
        // Deleting the employee from the database
        await pool.query('DELETE FROM employee WHERE id = $1', [answer.employeeId]);
        console.log(`Employee ID ${answer.employeeId} deleted successfully.`);
    } catch (err) {
        console.error('Error deleting employee:', err);
    }
    employeeApp();
}

// function to delete a role
async function deleteRole() {
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'roleId',
            message: 'Enter the Role ID to delete:'
        }
    ]);

    try {
        // Deleting the role from the database
        await pool.query('DELETE FROM role WHERE id = $1', [answer.roleId]);
        console.log(`Role ID ${answer.roleId} deleted successfully.`);
    } catch (err) {
        console.error('Error deleting role:', err);
    }
    employeeApp();
}

// function to delete a department
async function deleteDepartment() {
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'departmentId',
            message: 'Enter the Department ID to delete:'
        }
    ]);

    try {
        // Deleting the department from the database
        await pool.query('DELETE FROM department WHERE id = $1', [answer.departmentId]);
        console.log(`Department ID ${answer.departmentId} deleted successfully.`);
    } catch (err) {
        console.error('Error deleting department:', err);
    }
    employeeApp();
}

// function to view the total budget by department
async function viewTotalBudgetByDepartment() {
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'departmentId',
            message: 'Enter the Department ID to view its total utilized budget:'
        }
    ]);

    try {
        const result = await pool.query(`
            SELECT SUM(role.salary) AS total_budget
            FROM employee
            JOIN role ON employee.role_id = role.id
            WHERE role.department_id = $1
        `, [answer.departmentId]);

        console.log(`Total Utilized Budget for Department ID ${answer.departmentId}: $${result.rows[0].total_budget}`);
    } catch (err) {
        console.error('Error calculating total budget for department:', err);
    }
    employeeApp();
}

// Start the CLI application
employeeApp();