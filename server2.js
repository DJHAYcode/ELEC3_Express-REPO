const express = require('express');
const path = require('path');
const chalk = require('chalk');
const app = express();
const port = 3000;

const students = [
    { id: 1, name: 'John Doe', age: 20 },
    { id: 2, name: 'Jane Smith', age: 22 },
    { id: 3, name: 'Alice Johnson', age: 21 }
];

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
    console.log(chalk.blue(`Method: ${req.method} | URL: ${req.url}`));
    next();
});

// Home
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Get all students
app.get('/students', (req, res) => {
    res.json(students);
});

// Get one student
app.get('/students/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const student = students.find(student => student.id === id);

    if (student) {
        res.json(student);
    } else {
        res.status(404).send('Student not found');
    }
});

// Display HTML form
app.get('/myform', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'form.html');

    res.sendFile(filePath);
});

// Add student
app.post('/students', (req, res) => {
    const id = parseInt(req.body.id);
    const name = req.body.name;
    const age = parseInt(req.body.age);

    const newStudent = {
        id: id,
        name: name,
        age: age
    };

    students.push(newStudent);

    res.send('Student added successfully');
});

// Update student
app.put('/students/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const student = students.find(student => student.id === id);

    if (student) {
        student.name = req.body.name;
        student.age = parseInt(req.body.age);

        res.send('Student updated successfully');
    } else {
        res.status(404).send('Student not found');
    }
});

// Delete student
app.delete('/students/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const index = students.findIndex(student => student.id === id);

    if (index !== -1) {
        students.splice(index, 1);

        res.send('Student deleted successfully');
    } else {
        res.status(404).send('Student not found');
    }
});

// Invalid URL
app.use((req, res) => {
    res.status(404).send('Invalid URL');
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});