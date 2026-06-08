const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const tasksFile = path.join(__dirname, "data", "tasks.json");

// Home Route
app.get("/", (req, res) => {
  res.send("Task Manager API Running");
});

// Get All Tasks
app.get("/tasks", (req, res) => {
  try {
    const data = fs.readFileSync(tasksFile, "utf8");
    const tasks = JSON.parse(data);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Error reading tasks",
    });
  }
});

// Add Task
app.post("/tasks", (req, res) => {
  try {
    const data = fs.readFileSync(tasksFile, "utf8");
    const tasks = JSON.parse(data);

    const newTask = {
      id: Date.now(),
      title: req.body.title,
      description: req.body.description || "",
      dueDate: req.body.dueDate || "",
      completed: false,
      createdAt: new Date().toISOString(),
    };

    tasks.unshift(newTask);

    fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({
      message: "Error creating task",
    });
  }
});

// Delete Task
app.delete("/tasks/:id", (req, res) => {
  try {
    const data = fs.readFileSync(tasksFile, "utf8");
    const tasks = JSON.parse(data);

    const updatedTasks = tasks.filter(
      (task) => task.id !== Number(req.params.id)
    );

    fs.writeFileSync(tasksFile, JSON.stringify(updatedTasks, null, 2));

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting task",
    });
  }
});

// Toggle Complete / Incomplete
app.put("/tasks/:id", (req, res) => {
  try {
    const data = fs.readFileSync(tasksFile, "utf8");
    const tasks = JSON.parse(data);

    const updatedTasks = tasks.map((task) => {
      if (task.id === Number(req.params.id)) {
        return {
          ...task,
          completed: !task.completed,
        };
      }
      return task;
    });

    fs.writeFileSync(tasksFile, JSON.stringify(updatedTasks, null, 2));

    res.json({
      message: "Task updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating task",
    });
  }
});

app.put("/tasks/edit/:id", (req, res) => {
  try {
    const data = fs.readFileSync(tasksFile, "utf8");
    const tasks = JSON.parse(data);

    const updatedTasks = tasks.map((task) => {
      if (task.id === Number(req.params.id)) {
        return {
          ...task,
          title: req.body.title,
          description: req.body.description,
          dueDate: req.body.dueDate,
        };
      }
      return task;
    });

    fs.writeFileSync(tasksFile, JSON.stringify(updatedTasks, null, 2));

    res.json({
      message: "Task updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error editing task",
    });
  }
});

// Update task order (for drag and drop)
app.put("/tasks/reorder", (req, res) => {
  try {
    const { orderedTaskIds } = req.body;
    const data = fs.readFileSync(tasksFile, "utf8");
    const tasks = JSON.parse(data);
    
    // Create a map of task id to task object
    const taskMap = new Map();
    tasks.forEach(task => {
      taskMap.set(task.id, task);
    });
    
    // Reorder tasks based on the ordered IDs
    const reorderedTasks = orderedTaskIds.map(id => taskMap.get(id)).filter(task => task !== undefined);
    
    fs.writeFileSync(tasksFile, JSON.stringify(reorderedTasks, null, 2));
    
    res.json({ message: "Order updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating order" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});