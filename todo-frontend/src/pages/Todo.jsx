import { useState, useEffect } from "react";
import { API_BASE } from "../api";
import { getAuthHeaders } from "../utils/auth";

function Todo() {
  const [title, setTitle] = useState("");
  const [todos, setTodos] = useState([]);

  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");


  // ✅ Fetch Todos
  const fetchTodos = async () => {
  try {
    const res = await fetch(`${API_BASE}/todos`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    setTodos(data.todos);
  } catch (error) {
    console.log(error);
  }
};

  // ✅ Add Todo
  const addTodo = async () => {
  if (!title) return;

  await fetch(`${API_BASE}/todos`, {  // ✅ NO id
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title }),
  });

  setTitle("");
  fetchTodos();
};

  // ✅ Delete
  const deleteTodo = async (id) => {
  await fetch(`${API_BASE}/todos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  fetchTodos();
};


  // ✅ Toggle Complete
  const toggleComplete = async (id, status) => {
  await fetch(`${API_BASE}/todos/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),   // ✅ use this
    body: JSON.stringify({ completed: !status })
  });

  fetchTodos();
};

  // ✅ Start Editing
  const startEdit = (todo) => {
    setEditId(todo._id);
    setEditText(todo.title);
  };

  // ✅ Save Edit
  const saveEdit = async (id) => {
  await fetch(`${API_BASE}/todos/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),   // ✅ use this
    body: JSON.stringify({ title: editText })
  });

  setEditId(null);
  setEditText("");
  fetchTodos();
};

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  

  return (
    <div className="min-h-screen bg-purple-100 flex items-center justify-center">

      <div className="bg-white shadow-2xl rounded-2xl p-6 w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-4">
          ✨ Todo App
        </h2>

        {/* Add Todo */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter todo..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={addTodo}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add
          </button>
        </div>

        {/* Logout */}
        <p
          onClick={logout}
          className="text-red-500 text-sm cursor-pointer mb-3 hover:underline"
        >
          Logout
        </p>

        {/* Empty State */}
        {todos.length === 0 && (
          <p className="text-center text-gray-400">No todos yet 💤</p>
        )}

        {/* Todo List */}
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo._id}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-2 w-full">

                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo._id, todo.completed)}
                />

                {/* TEXT OR INPUT */}
                {editId === todo._id ? (
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 border px-2 py-1 rounded"
                  />
                ) : (
                  <span
                    className={`flex-1 ${
                      todo.completed
                        ? "line-through text-gray-400"
                        : ""
                    }`}
                  >
                    {todo.title}
                  </span>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 ml-2">

                {editId === todo._id ? (
                  <button
                    onClick={() => saveEdit(todo._id)}
                    className="text-green-500 hover:text-green-700"
                  >
                    💾
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(todo)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ✏️
                  </button>
                )}

                <button
                  onClick={() => deleteTodo(todo._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ❌
                </button>

              </div>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}

export default Todo;