import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

const API_URL = 'http://localhost:3001';

export default function Todos() {
  const { userId } = useParams();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Controls state
  const [sortCriterion, setSortCriterion] = useState('id');
  const [searchCriterion, setSearchCriterion] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Adding & Editing state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, [userId]);

  const fetchTodos = async () => {
    try {
      const response = await fetch(  `${API_URL}/todos?userId=${userId}`);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add Action
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          title: newTitle,
          completed: false
        })
      });
      const newTodo = await response.json();
      setTodos([...todos, newTodo]);
      setNewTitle('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  // Delete Action
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' });
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  // Update Status Action
  const handleToggleComplete = async (todo) => {
    try {
      const response = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      });
      const updated = await response.json();
      setTodos(todos.map(t => t.id === todo.id ? updated : t));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Update Content (Title) Action
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const handleSaveEdit = async (todo) => {
    if (!editTitle.trim()) return;
    try {
      const response = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle })
      });
      const updated = await response.json();
      setTodos(todos.map(t => t.id === todo.id ? updated : t));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  // 1. Filter Logic
  const filteredTodos = todos.filter(todo => {
    if (!searchQuery) return true;
    
    if (searchCriterion === 'id') {
      return todo.id.toString().includes(searchQuery);
    }
    if (searchCriterion === 'title') {
      return todo.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (searchCriterion === 'completed') {
      const query = searchQuery.toLowerCase();
      if (query === 'true' || query === 'done') return todo.completed === true;
      if (query === 'false' || query === 'pending') return todo.completed === false;
      return true; 
    }
    return true;
  });

  // 2. Sort Logic
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortCriterion === 'id') return a.id - b.id;
    if (sortCriterion === 'title') return a.title.localeCompare(b.title);
    if (sortCriterion === 'completed') {
      // Completed items go to the bottom
      return (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
    }
    return 0;
  });

  if (loading) return <div className="text-center mt-2 text-muted">Loading Todos...</div>;

  return (
    <div className="feature-container">
      <div className="flex-between mb-2">
        <h2 className="page-title" style={{ marginBottom: 0 }}>My Todos</h2>
        <button className="btn-primary" style={{ width: 'auto', margin: 0 }} onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? <X size={20} /> : <Plus size={20} />} {isAdding ? 'Cancel' : 'New Todo'}
        </button>
      </div>

      {/* Action Controls: Sorting & Searching */}
      <div className="controls-row auth-card">
        <div className="form-group">
          <label>Sort By</label>
          <select className="form-control" value={sortCriterion} onChange={(e) => setSortCriterion(e.target.value)}>
            <option value="id">ID</option>
            <option value="title">Title</option>
            <option value="completed">Status</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Search By</label>
          <select className="form-control" value={searchCriterion} onChange={(e) => setSearchCriterion(e.target.value)}>
            <option value="id">ID</option>
            <option value="title">Title</option>
            <option value="completed">Status</option>
          </select>
        </div>

        <div className="form-group search-input-group">
          <label>Search Query</label>
          {searchCriterion === 'completed' ? (
            <select className="form-control" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}>
              <option value="">All</option>
              <option value="done">Done</option>
              <option value="pending">Pending</option>
            </select>
          ) : (
            <input 
              type="text" 
              className="form-control" 
              placeholder={`Search by ${searchCriterion}...`} 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          )}
        </div>
      </div>

      {/* Add New Todo Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="auth-card add-form">
          <input 
            type="text" 
            className="form-control" 
            placeholder="What needs to be done?" 
            value={newTitle} 
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto', margin: 0 }}>Save</button>
        </form>
      )}

      {/* Todo List Display */}
      <div className="list-container">
        {sortedTodos.map(todo => (
          <div key={todo.id} className={`list-item ${todo.completed ? 'completed' : ''}`}>
            <div className="list-item-left">
              <input 
                type="checkbox" 
                className="custom-checkbox"
                checked={todo.completed}
                onChange={() => handleToggleComplete(todo)}
              />
              <span className="item-id">#{todo.id}</span>
              
              {editingId === todo.id ? (
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ padding: '0.25rem 0.5rem' }}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(todo)}
                  autoFocus
                />
              ) : (
                <span className="item-title">
                  {todo.title}
                </span>
              )}
            </div>

            <div className="list-item-actions">
              {editingId === todo.id ? (
                <button className="icon-btn success" onClick={() => handleSaveEdit(todo)} title="Save"><Save size={18} /></button>
              ) : (
                <button className="icon-btn" onClick={() => startEdit(todo)} title="Edit"><Edit2 size={18} /></button>
              )}
              <button className="icon-btn danger" onClick={() => handleDelete(todo.id)} title="Delete"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
        {sortedTodos.length === 0 && <div className="empty-state">No todos found matching your criteria.</div>}
      </div>
    </div>
  );
}
