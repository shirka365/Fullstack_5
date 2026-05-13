import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, Edit2, Save, X, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';

const API_URL = 'http://localhost:3001';

export default function Posts() {
  const { userId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Current User for comments validation
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  // Controls state
  const [searchCriterion, setSearchCriterion] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Adding & Editing Post
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostBody, setEditPostBody] = useState('');

  // Selected Post & Comments
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  // Adding & Editing Comment
  const [newCommentBody, setNewCommentBody] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentBody, setEditCommentBody] = useState('');

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, [userId]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/posts?userId=${userId}`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // ----- POST ACTIONS -----
  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostBody.trim()) return;

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          title: newPostTitle,
          body: newPostBody
        })
      });
      const newPost = await response.json();
      setPosts([newPost, ...posts]); // Add to top
      setNewPostTitle('');
      setNewPostBody('');
      setIsAddingPost(false);
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const handleDeletePost = async (id) => {
  try {

    const commentsRes = await fetch(`${API_URL}/comments?postId=${id}`);
    const postComments = await commentsRes.json();

    await Promise.all(
      postComments.map(comment =>
        fetch(`${API_URL}/comments/${comment.id}`, {
          method: 'DELETE'
        })
      )
    );

    await fetch(`${API_URL}/posts/${id}`, {
      method: 'DELETE'
    });

    setPosts(posts.filter(p => p.id !== id));

    if (selectedPostId === id) {
      setSelectedPostId(null);
      setComments([]);
      setShowComments(false);
    }

  } catch (error) {
    console.error('Error deleting post:', error);
  }
};

  const startEditPost = (post) => {
    setEditingPostId(post.id);
    setEditPostTitle(post.title);
    setEditPostBody(post.body);
  };

  const handleSaveEditPost = async (post) => {
    if (!editPostTitle.trim() || !editPostBody.trim()) return;
    try {
      const response = await fetch(`${API_URL}/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editPostTitle, body: editPostBody })
      });
      const updated = await response.json();
      setPosts(posts.map(p => p.id === post.id ? updated : p));
      setEditingPostId(null);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const toggleSelectPost = (id) => {
    if (selectedPostId === id) {
      setSelectedPostId(null);
      setShowComments(false);
      setComments([]);
    } else {
      setSelectedPostId(id);
      setShowComments(false);
      setComments([]);
    }
  };

  // ----- COMMENT ACTIONS -----
  const loadComments = async (postId) => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setLoadingComments(true);
    try {
      const response = await fetch(`${API_URL}/comments?postId=${postId}`);
      const data = await response.json();
      setComments(data);
      setShowComments(true);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentBody.trim()) return;

    try {
      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: selectedPostId,
          name: currentUser.name,
          email: currentUser.email,
          body: newCommentBody
        })
      });
      const newComment = await response.json();
      setComments([...comments, newComment]);
      setNewCommentBody('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await fetch(`${API_URL}/comments/${id}`, { method: 'DELETE' });
      setComments(comments.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentBody(comment.body);
  };

  const handleSaveEditComment = async (comment) => {
    if (!editCommentBody.trim()) return;
    try {
      const response = await fetch(`${API_URL}/comments/${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editCommentBody })
      });
      const updated = await response.json();
      setComments(comments.map(c => c.id === comment.id ? updated : c));
      setEditingCommentId(null);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  // ----- Filter Logic -----
  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    if (searchCriterion === 'id') {
      return post.id.toString().includes(searchQuery);
    }
    if (searchCriterion === 'title') {
      return post.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (loading) return <div className="text-center mt-2 text-muted">Loading Posts...</div>;

  return (
    <div className="feature-container">
      <div className="flex-between mb-2">
        <h2 className="page-title" style={{ marginBottom: 0 }}>My Posts</h2>
        <button className="btn-primary" style={{ width: 'auto', margin: 0 }} onClick={() => setIsAddingPost(!isAddingPost)}>
          {isAddingPost ? <X size={20} /> : <Plus size={20} />} {isAddingPost ? 'Cancel' : 'New Post'}
        </button>
      </div>

      {/* Action Controls: Searching */}
      <div className="controls-row auth-card">
        <div className="form-group">
          <label>Search By</label>
          <select className="form-control" value={searchCriterion} onChange={(e) => setSearchCriterion(e.target.value)}>
            <option value="id">ID</option>
            <option value="title">Title</option>
          </select>
        </div>

        <div className="form-group search-input-group">
          <label>Search Query</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder={`Search by ${searchCriterion}...`} 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>

      {/* Add New Post Form */}
      {isAddingPost && (
        <form onSubmit={handleAddPost} className="auth-card add-form" style={{ flexDirection: 'column' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Post Title" 
            value={newPostTitle} 
            onChange={(e) => setNewPostTitle(e.target.value)}
            required
          />
          <textarea 
            className="form-control" 
            placeholder="Write your post here..." 
            value={newPostBody} 
            onChange={(e) => setNewPostBody(e.target.value)}
            rows="3"
            required
            style={{ resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" style={{ width: 'auto', margin: 0 }}>Publish Post</button>
          </div>
        </form>
      )}

      {/* Post List Display */}
      <div className="list-container">
        {filteredPosts.map(post => {
          const isSelected = selectedPostId === post.id;
          const isEditing = editingPostId === post.id;

          return (
            <div key={post.id} className={`list-item ${isSelected ? 'selected-post' : ''}`} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              
              {/* POST SUMMARY (Always visible) */}
              <div className="flex-between">
                <div 
                  className="list-item-left" 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => !isEditing && toggleSelectPost(post.id)}
                >
                  <span className="item-id" style={{ minWidth: '30px' }}>#{post.id}</span>
                  {isEditing ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '1rem' }} onClick={e => e.stopPropagation()}>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editPostTitle}
                        onChange={(e) => setEditPostTitle(e.target.value)}
                      />
                    </div>
                  ) : (
                    <span className="item-title" style={{ color: isSelected ? 'var(--primary)' : 'var(--text-main)', fontWeight: isSelected ? '600' : '500' }}>
                      {post.title}
                    </span>
                  )}
                </div>

                <div className="list-item-actions" onClick={e => e.stopPropagation()}>
                  {isEditing ? (
                    <button className="icon-btn success" onClick={() => handleSaveEditPost(post)} title="Save"><Save size={18} /></button>
                  ) : (
                    <button className="icon-btn" onClick={() => startEditPost(post)} title="Edit"><Edit2 size={18} /></button>
                  )}
                  <button className="icon-btn danger" onClick={() => handleDeletePost(post.id)} title="Delete"><Trash2 size={18} /></button>
                </div>
              </div>

              {/* EXPANDED EDIT CONTENT */}
              {isEditing && (
                <div className="post-content mt-2 pt-2 border-t">
                  <textarea 
                    className="form-control" 
                    value={editPostBody}
                    onChange={(e) => setEditPostBody(e.target.value)}
                    rows="4"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              )}

              {/* EXPANDED CONTENT (Reading) */}
              {isSelected && !isEditing && (
                <div className="post-content mt-2 pt-2 border-t">
                  <p className="text-body" style={{ lineHeight: '1.6', color: '#e2e8f0', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
                    {post.body}
                  </p>
                  
                  <button 
                    className="btn-outline" 
                    onClick={() => loadComments(post.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <MessageSquare size={16} /> 
                    {showComments ? 'Hide Comments' : 'Show Comments'} 
                    {showComments ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {loadingComments && <div className="text-muted mt-2">Loading comments...</div>}
                  
                  {/* COMMENTS SECTION */}
                  {showComments && (
                    <div className="comments-section mt-2 pt-2" style={{ borderLeft: '2px solid var(--border)', paddingLeft: '1rem' }}>
                      <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>COMMENTS</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                        {comments.map(comment => {
                          const isMyComment = currentUser?.email && comment.email === currentUser.email;
                          const isEditingComment = editingCommentId === comment.id;

                          return (
                            <div key={comment.id} className="comment-card" style={{ padding: '0.75rem', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '0.5rem' }}>
                              <div className="flex-between mb-1">
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>{comment.name} ({comment.email})</span>
                                {isMyComment && (
                                  <div className="list-item-actions">
                                    {isEditingComment ? (
                                      <button className="icon-btn success" style={{ padding: '0.25rem' }} onClick={() => handleSaveEditComment(comment)}><Save size={14} /></button>
                                    ) : (
                                      <button className="icon-btn" style={{ padding: '0.25rem' }} onClick={() => startEditComment(comment)}><Edit2 size={14} /></button>
                                    )}
                                    <button className="icon-btn danger" style={{ padding: '0.25rem' }} onClick={() => handleDeleteComment(comment.id)}><Trash2 size={14} /></button>
                                  </div>
                                )}
                              </div>
                              
                              {isEditingComment ? (
                                <textarea 
                                  className="form-control" 
                                  value={editCommentBody}
                                  onChange={(e) => setEditCommentBody(e.target.value)}
                                  rows="2"
                                  style={{ marginTop: '0.5rem', fontSize: '0.875rem', resize: 'vertical' }}
                                />
                              ) : (
                                <p style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{comment.body}</p>
                              )}
                            </div>
                          );
                        })}
                        {comments.length === 0 && <div className="text-muted" style={{ fontSize: '0.875rem' }}>No comments yet.</div>}
                      </div>

                      {/* ADD COMMENT FORM */}
                      <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Write a comment..." 
                          value={newCommentBody} 
                          onChange={(e) => setNewCommentBody(e.target.value)}
                          required
                          style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                        />
                        <button type="submit" className="btn-primary" style={{ width: 'auto', margin: 0, padding: '0.5rem 1rem' }}>Post</button>
                      </form>

                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filteredPosts.length === 0 && <div className="empty-state">No posts found matching your criteria.</div>}
      </div>
    </div>
  );
}
