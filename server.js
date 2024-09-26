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
        case 'Quit':
            await pool.end(); // we want to close PostgreSQL pool when quitting
            console.log('Exiting the program...');
            process.exit(0);
            break;
        // need to add more cases here TODO:


        default:
            console.log('Invalid choice, please try again.');
    }
    employeeApp();
}

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


employeeApp();