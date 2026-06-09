import { useEffect, useRef, useState } from "react";
import "./App.css";

const API = "https://personal-task-manager-api-bydr.onrender.com";

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

  // ── Long-press tracking refs (no re-render needed) ──
  const longPressTimer = useRef(null);   // setTimeout handle
  const isDragging = useRef(false);      // true only after long press fires
  const touchIndex = useRef(null);       // which card the finger is on

  const fetchTasks = () => {
    fetch(`${API}/tasks`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => { fetchTasks(); }, []);

  const addTask = async (e) => {
    e.preventDefault();
    await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, dueDate }),
    });
    setTitle(""); setDescription(""); setDueDate("");
    fetchTasks();
  };

  const toggleComplete = async (id) => {
    await fetch(`${API}/tasks/${id}`, { method: "PUT" });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  const startEdit = (task) => {
    setEditId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditDate(task.dueDate);
  };

  const saveEdit = async (id) => {
    await fetch(`${API}/tasks/edit/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, description: editDesc, dueDate: editDate }),
    });
    setEditId(null);
    fetchTasks();
  };

  const isOverdue = (task) =>
    task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  const filteredTasks = tasks.filter((task) => {
    const statusMatch =
      filter === "active" ? !task.completed :
      filter === "completed" ? task.completed : true;
    const searchMatch =
      searchTerm.trim() === "" ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  // ── Desktop Drag & Drop ──
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
    const [moved] = newTasks.splice(draggedItem, 1);
    newTasks.splice(index, 0, moved);
    const orderedIds = newTasks.map((t) => t.id);
    const rest = tasks.filter((t) => !orderedIds.includes(t.id));
    setTasks([...newTasks, ...rest]);
    setDraggedItem(index);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const orderedTaskIds = filteredTasks.map((t) => t.id);
    try {
      await fetch(`${API}/tasks/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedTaskIds }),
      });
    } catch { fetchTasks(); }
    setDraggedItem(null);
  };

  // ── Mobile Touch: Long Press to Drag ──
  // User must hold finger for 500ms before drag activates.
  // A quick tap or scroll does NOT trigger drag.

  const handleTouchStart = (e, index) => {
    touchIndex.current = index;
    isDragging.current = false;

    // Start a 500ms timer — only if it completes, drag mode turns on
    longPressTimer.current = setTimeout(() => {
      isDragging.current = true;
      setDraggedItem(index);
      // Light vibration feedback on devices that support it
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const handleTouchMove = (e) => {
    // If long press hasn't fired yet, cancel it — user is scrolling
    if (!isDragging.current) {
      clearTimeout(longPressTimer.current);
      return; // let the browser scroll normally
    }

    // Long press already fired — we are in drag mode, prevent scroll
    e.preventDefault();

    const touch = e.touches[0];
    const elements = document.querySelectorAll(".task-card");

    elements.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (
        touch.clientY > rect.top &&
        touch.clientY < rect.bottom &&
        draggedItem !== i
      ) {
        const newTasks = [...filteredTasks];
        const [moved] = newTasks.splice(draggedItem, 1);
        newTasks.splice(i, 0, moved);
        const orderedIds = newTasks.map((t) => t.id);
        const rest = tasks.filter((t) => !orderedIds.includes(t.id));
        setTasks([...newTasks, ...rest]);
        setDraggedItem(i);
      }
    });
  };

  const handleTouchEnd = async (e) => {
    clearTimeout(longPressTimer.current);

    if (isDragging.current) {
      const orderedTaskIds = filteredTasks.map((t) => t.id);
      try {
        await fetch(`${API}/tasks/reorder`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedTaskIds }),
        });
      } catch { fetchTasks(); }
    }

    isDragging.current = false;
    setDraggedItem(null);
  };

  return (
    <div className="app">
      <h1 className="title">📋 PERSONAL TASK MANAGER</h1>

      <div className="layout">

        {/* ── LEFT PANEL ── */}
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

        {/* ── RIGHT PANEL ── */}
        <div className="right-panel">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search tasks by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <div className="search-result-count">
              Found {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} matching "{searchTerm}"
            </div>
          )}

          <div className="filter-buttons">
            {["all", "active", "completed"].map((f) => (
              <button
                key={f}
                className={filter === f ? "active" : ""}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="section-title-wrapper">
            <p className="section-title">My Tasks</p>
          </div>

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div className="empty">
                {searchTerm ? (
                  <><div className="empty-icon">🔍</div><div>No tasks match your search</div></>
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
                  onTouchMove={handleTouchMove}
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
