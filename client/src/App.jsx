import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");

  const fetchTasks = () => {
    fetch("https://personal-task-manager-api-bydr.onrender.com/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    await fetch("https://personal-task-manager-api-bydr.onrender.com/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, dueDate }),
    });
    setTitle("");
    setDescription("");
    setDueDate("");
    fetchTasks();
  };

  const toggleComplete = async (id) => {
    await fetch(`https://personal-task-manager-api-bydr.onrender.com/tasks/${id}`, { method: "PUT" });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await fetch(`https://personal-task-manager-api-bydr.onrender.com/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  const startEdit = (task) => {
    setEditId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditDate(task.dueDate);
  };

  const saveEdit = async (id) => {
    await fetch(`https://personal-task-manager-api-bydr.onrender.com/tasks/edit/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDesc,
        dueDate: editDate,
      }),
    });
    setEditId(null);
    fetchTasks();
  };

  const isOverdue = (task) =>
    task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  const filteredTasks = tasks.filter((task) => {
    const statusMatch =
      filter === "active" ? !task.completed : filter === "completed" ? task.completed : true;
    const searchMatch =
      searchTerm.trim() === "" || task.title.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  // ── Drag & Drop Handlers (Desktop + Mobile) ──
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.4";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "";
    setDraggedItem(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    
    const newTasks = [...filteredTasks];
    const draggedTask = newTasks[draggedItem];
    newTasks.splice(draggedItem, 1);
    newTasks.splice(index, 0, draggedTask);
    
    const orderedTaskIds = newTasks.map(task => task.id);
    const remainingTasks = tasks.filter(task => !orderedTaskIds.includes(task.id));
    const reorderedFullTasks = [...newTasks, ...remainingTasks];
    
    setTasks(reorderedFullTasks);
    setDraggedItem(index);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.currentTarget.style.opacity = "";
    
    const orderedTaskIds = filteredTasks.map(task => task.id);
    try {
      await fetch("https://personal-task-manager-api-bydr.onrender.com/tasks/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedTaskIds }),
      });
    } catch (error) {
      console.error("Failed to save order:", error);
      fetchTasks();
    }
    setDraggedItem(null);
  };

  // Mobile touch handlers
  let touchTimeout;
  const handleTouchStart = (e, index) => {
    e.preventDefault();
    touchTimeout = setTimeout(() => {
      setDraggedItem(index);
      e.currentTarget.style.opacity = "0.4";
    }, 100);
  };

  const handleTouchMove = (e, index) => {
    e.preventDefault();
    if (draggedItem === null) return;
    
    const touch = e.touches[0];
    const elements = document.querySelectorAll('.task-card');
    
    elements.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (touch.clientY > rect.top && touch.clientY < rect.bottom && draggedItem !== i) {
        const newTasks = [...filteredTasks];
        const draggedTask = newTasks[draggedItem];
        newTasks.splice(draggedItem, 1);
        newTasks.splice(i, 0, draggedTask);
        
        const orderedTaskIds = newTasks.map(task => task.id);
        const remainingTasks = tasks.filter(task => !orderedTaskIds.includes(task.id));
        const reorderedFullTasks = [...newTasks, ...remainingTasks];
        
        setTasks(reorderedFullTasks);
        setDraggedItem(i);
      }
    });
  };

  const handleTouchEnd = async (e) => {
    clearTimeout(touchTimeout);
    e.currentTarget.style.opacity = "";
    
    if (draggedItem !== null) {
      const orderedTaskIds = filteredTasks.map(task => task.id);
      try {
        await fetch("https://personal-task-manager-api-bydr.onrender.com/tasks/reorder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedTaskIds }),
        });
      } catch (error) {
        console.error("Failed to save order:", error);
        fetchTasks();
      }
    }
    setDraggedItem(null);
  };

  return (
    <div className="app">
      <h1 className="title">📋 PERSONAL TASK MANAGER</h1>

      <div className="layout">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <form className="form" onSubmit={addTask}>
            <h2>New Task</h2>
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <button type="submit" className="add-btn">+ Add Task</button>
          </form>

          <div className="stats">
            <div className="stat-card">
              <div className="stat-number">{activeCount}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{completedCount}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          {/* Search Bar */}
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search tasks by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Search Result Count */}
          {searchTerm && (
            <div className="search-result-count">
              Found {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} matching "{searchTerm}"
            </div>
          )}

          {/* Filter Buttons */}
          <div className="filter-buttons">
            {["all", "active", "completed"].map((f) => (
              <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* My Tasks */}
          <div className="section-title-wrapper">
            <p className="section-title">My Tasks</p>
          </div>

          {/* Task List with Drag & Drop */}
          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div className="empty">
                {searchTerm ? (
                  <>
                    <div className="empty-icon">🔍</div>
                    <div>No tasks match your search</div>
                  </>
                ) : (
                  "No tasks here 🎉"
                )}
              </div>
            ) : (
              filteredTasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`task-card ${isOverdue(task) ? "overdue" : ""} ${task.completed ? "done" : ""}`}
                  draggable={editId !== task.id}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={handleDrop}
                  onTouchStart={(e) => handleTouchStart(e, index)}
                  onTouchMove={(e) => handleTouchMove(e, index)}
                  onTouchEnd={handleTouchEnd}
                >
                  {editId !== task.id ? (
                    <>
                      <div className="drag-handle">⋮⋮</div>
                      <div className="task-title">{task.title}</div>
                      {task.description && <div className="task-desc">{task.description}</div>}
                      <div className="task-meta">
                        {task.dueDate && <span>📅 {task.dueDate}</span>}
                        <span className={`badge ${isOverdue(task) ? "overdue" : task.completed ? "done" : "active"}`}>
                          {isOverdue(task) ? "Overdue" : task.completed ? "Done" : "Active"}
                        </span>
                      </div>
                      <div className="task-buttons">
                        <button className="complete-btn" onClick={() => toggleComplete(task.id)}>
                          {task.completed ? "Undo" : "✓ Done"}
                        </button>
                        <button className="edit-btn" onClick={() => startEdit(task)}>Edit</button>
                        <button className="delete-btn" onClick={() => deleteTask(task.id)}>Delete</button>
                      </div>
                    </>
                  ) : (
                    <div className="edit-form">
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" />
                      <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description" rows={2} />
                      <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                      <div className="task-buttons">
                        <button className="save-btn" onClick={() => saveEdit(task.id)}>Save</button>
                        <button className="cancel-btn" onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;