import express from 'express';
import fs from 'fs';
import path  from 'path';
import cors from 'cors';
import morgan from 'morgan';
const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk');

const app = express();
const port = 3000;
const dataFilePath = path.join(__dirname, 'data', 'students.json');

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

function readStudents(callback) {
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) return callback(err);
    callback(null, JSON.parse(data));
  });
}

function writeStudents(students, callback) {
  fs.writeFile(dataFilePath, JSON.stringify(students, null, 2), callback);
}

function validate(body) {
  const errors = [];
  ['name', 'course', 'year', 'email'].forEach((f) => {
    if (!body[f]) errors.push(`'${f}' is required.`);
  });
  if (body.year && (body.year < 1 || body.year > 6)) {
    errors.push("'year' must be between 1 and 6.");
  }
  return errors;
}

// localhost:3000 (GET)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Student Management REST API' });
});

// localhost:3000/api/students (GET)
app.get('/api/students', (req, res) => {
  readStudents((err, students) => {
    if (err) return res.status(500).json({ error: 'Read failed' });
    console.log(chalk.yellow('Fetched all students'));
    res.status(200).json(students);
  });
});

// localhost:3000/api/students/1
app.get('/api/students/:id', (req, res) => {
  readStudents((err, students) => {
    if (err) return res.status(500).json({ error: 'Read failed' });
    const student = students.find((s) => s.id === req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    console.log(chalk.yellow(`Found student ${req.params.id}`));
    res.status(200).json(student);
  });
});

// localhost:3000/api/students (POST)
app.post('/api/students', (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });

  readStudents((err, students) => {
    if (err) return res.status(500).json({ error: 'Read failed' });
    const newStudent = { id: uuidv4(), ...req.body };
    students.push(newStudent);
    writeStudents(students, (writeErr) => {
      if (writeErr) return res.status(500).json({ error: 'Write failed' });
      console.log(chalk.green(`Added student ${newStudent.id}`));
      res.status(201).json(newStudent);
    });
  });
});

// localhost:3000/api/students/1
app.put('/api/students/:id', (req, res) => {
  readStudents((err, students) => {
    if (err) return res.status(500).json({ error: 'Read failed' });
    const index = students.findIndex((s) => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Student not found' });

    students[index] = { ...students[index], ...req.body, id: req.params.id };
    writeStudents(students, (writeErr) => {
      if (writeErr) return res.status(500).json({ error: 'Write failed' });
      console.log(chalk.blue(`Updated student ${req.params.id}`));
      res.status(200).json(students[index]);
    });
  });
});

// localhost:3000/api/students/1
app.delete('/api/students/:id', (req, res) => {
  readStudents((err, students) => {
    if (err) return res.status(500).json({ error: 'Read failed' });
    const index = students.findIndex((s) => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Student not found' });

    const removed = students.splice(index, 1)[0];
    writeStudents(students, (writeErr) => {
      if (writeErr) return res.status(500).json({ error: 'Write failed' });
      console.log(chalk.red(`Deleted student ${req.params.id}`));
      res.status(200).json({ message: 'Deleted', student: removed });
    });
  });
});

app.listen(port, () => {
  console.log(`Student API listening on port ${port}`);
});