import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, Edit2, Save, X, Image as ImageIcon, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:3001';

export default function Albums() {
  
  const { userId } = useParams();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search Controls
  const [searchCriterion, setSearchCriterion] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');

  // Album actions
  const [isAddingAlbum, setIsAddingAlbum] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [editAlbumTitle, setEditAlbumTitle] = useState('');

  // Selected Album & Photos
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [photoPage, setPhotoPage] = useState(1);

  // Photo actions
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoThumbnail, setNewPhotoThumbnail] = useState('');
  const [editingPhotoId, setEditingPhotoId] = useState(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState('');
  const [hasMorePhotos, setHasMorePhotos] = useState(true);

  useEffect(() => {
    fetchAlbums();
  }, [userId]);

  const fetchAlbums = async () => {
    try {
      const response = await fetch(`${API_URL}/albums?userId=${userId}`);
      const data = await response.json();
      setAlbums(data);
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(false);
    }
  };

  // ----- ALBUM ACTIONS -----
  const handleAddAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;

    try {
      const response = await fetch(`${API_URL}/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(userId), title: newAlbumTitle })
      });
      const newAlbum = await response.json();
      setAlbums([newAlbum, ...albums]);
      setNewAlbumTitle('');
      setIsAddingAlbum(false);
    } catch (error) {
      console.error('Error adding album:', error);
    }
  };

  const handleDeleteAlbum = async (id) => {
    try {
      const photosRes = await fetch(`${API_URL}/photos?albumId=${id}`);
      const albumPhotos = await photosRes.json();

      await Promise.all(
        albumPhotos.map(photo =>
          fetch(`${API_URL}/photos/${photo.id}`, {
            method: 'DELETE'
          })
        )
      );

      
      await fetch(`${API_URL}/albums/${id}`, { method: 'DELETE' });

      setAlbums(albums.filter(a => a.id !== id));
      if (selectedAlbumId === id) setSelectedAlbumId(null);
    } catch (error) {
      console.error('Error deleting album:', error);
    }
  };

  const startEditAlbum = (album) => {
    setEditingAlbumId(album.id);
    setEditAlbumTitle(album.title);
  };

  const handleSaveEditAlbum = async (album) => {
    if (!editAlbumTitle.trim()) return;
    try {
      const response = await fetch(`${API_URL}/albums/${album.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editAlbumTitle })
      });
      const updated = await response.json();
      setAlbums(albums.map(a => a.id === album.id ? updated : a));
      setEditingAlbumId(null);
    } catch (error) {
      console.error('Error updating album:', error);
    }
  };

  const toggleSelectAlbum = async (id) => {
    if (selectedAlbumId === id) {
      setSelectedAlbumId(null);
      setPhotos([]);
      setHasMorePhotos(true);
      setPhotoPage(1);
    } else {
      setSelectedAlbumId(id);
      setIsAddingPhoto(false);
      setPhotos([]);
      setLoadingPhotos(true);
      try { 
        const response = await fetch(`${API_URL}/photos?albumId=${id}&_page=1&_limit=10`);
        const data = await response.json();
        setPhotos(data);
        setPhotoPage(1);
        setHasMorePhotos(data.length === 10);
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setLoadingPhotos(false);
      }
    }
  };

  // ----- PHOTO ACTIONS -----
  const handleLoadMorePhotos = async () => {
  const nextPage = photoPage + 1;

  try {
    const response = await fetch(
      `${API_URL}/photos?albumId=${selectedAlbumId}&_page=${nextPage}&_limit=10`
    );

    const data = await response.json();

    setPhotos(prev => [...prev, ...data]);
    setPhotoPage(nextPage);
    setHasMorePhotos(data.length === 10);

  } catch (error) {
    console.error('Error loading more photos:', error);
  }
};

  const handleGenerateRandomUrls = () => {
    const rId = Math.floor(Math.random() * 1000);
    setNewPhotoUrl(`https://picsum.photos/id/${rId}/600/600`);
    setNewPhotoThumbnail(`https://picsum.photos/id/${rId}/150/150`);
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newPhotoTitle.trim() || !newPhotoUrl.trim() || !newPhotoThumbnail.trim()) return;

    try {
      const response = await fetch(`${API_URL}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          albumId: selectedAlbumId,
          title: newPhotoTitle,
          url: newPhotoUrl,
          thumbnailUrl: newPhotoThumbnail
        })
      });
      const newPhoto = await response.json();
      setPhotos([newPhoto, ...photos]);
      setIsAddingPhoto(false);
      setNewPhotoTitle('');
      setNewPhotoUrl('');
      setNewPhotoThumbnail('');
    } catch (error) {
      console.error('Error adding photo:', error);
    }
  };

  const handleDeletePhoto = async (id) => {
    try {
      await fetch(`${API_URL}/photos/${id}`, { method: 'DELETE' });
      setPhotos(photos.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const startEditPhoto = (photo) => {
    setEditingPhotoId(photo.id);
    setEditPhotoTitle(photo.title);
  };

  const handleSaveEditPhoto = async (photo) => {
    if (!editPhotoTitle.trim()) return;
    try {
      const response = await fetch(`${API_URL}/photos/${photo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editPhotoTitle })
      });
      const updated = await response.json();
      setPhotos(photos.map(p => p.id === photo.id ? updated : p));
      setEditingPhotoId(null);
    } catch (error) {
      console.error('Error updating photo:', error);
    }
  };

  // ----- Filter Logic -----
  const filteredAlbums = albums.filter(album => {
    if (!searchQuery) return true;
    if (searchCriterion === 'id') {
      return album.id.toString().includes(searchQuery);
    }
    if (searchCriterion === 'title') {
      return album.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });


  if (loading) return <div className="text-center mt-2 text-muted">Loading Albums...</div>;

  return (
    <div className="feature-container" style={{ maxWidth: '1000px' }}>
      <div className="flex-between mb-2">
        <h2 className="page-title" style={{ marginBottom: 0 }}>My Albums</h2>
        <button className="btn-primary" style={{ width: 'auto', margin: 0 }} onClick={() => setIsAddingAlbum(!isAddingAlbum)}>
          {isAddingAlbum ? <X size={20} /> : <Plus size={20} />} {isAddingAlbum ? 'Cancel' : 'New Album'}
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

      {/* Add New Album Form */}
      {isAddingAlbum && (
        <form onSubmit={handleAddAlbum} className="auth-card add-form">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Album Title" 
            value={newAlbumTitle} 
            onChange={(e) => setNewAlbumTitle(e.target.value)}
            required
            autoFocus
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto', margin: 0 }}>Save Album</button>
        </form>
      )}

      {/* Album List Display */}
      <div className="list-container">
        {filteredAlbums.map(album => {
          const isSelected = selectedAlbumId === album.id;
          const isEditing = editingAlbumId === album.id;

          return (
            <div key={album.id} className={`list-item ${isSelected ? 'selected-post' : ''}`} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              
              {/* ALBUM SUMMARY */}
              <div className="flex-between">
                <div 
                  className="list-item-left" 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => !isEditing && toggleSelectAlbum(album.id)}
                >
                  <span className="item-id" style={{ minWidth: '30px' }}>#{album.id}</span>
                  {isEditing ? (
                    <div style={{ flex: 1, paddingRight: '1rem' }} onClick={e => e.stopPropagation()}>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editAlbumTitle}
                        onChange={(e) => setEditAlbumTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEditAlbum(album)}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <span className="item-title font-bold" style={{ color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                      <ImageIcon size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
                      {album.title}
                    </span>
                  )}
                </div>

                <div className="list-item-actions" onClick={e => e.stopPropagation()}>
                  {isEditing ? (
                    <button className="icon-btn success" onClick={() => handleSaveEditAlbum(album)} title="Save"><Save size={18} /></button>
                  ) : (
                    <button className="icon-btn" onClick={() => startEditAlbum(album)} title="Edit"><Edit2 size={18} /></button>
                  )}
                  <button className="icon-btn danger" onClick={() => handleDeleteAlbum(album.id)} title="Delete"><Trash2 size={18} /></button>
                </div>
              </div>

              {/* EXPANDED CONTENT (PHOTOS) */}
              {isSelected && !isEditing && (
                <div className="mt-2 pt-2 border-t">
                  
                  <div className="flex-between mb-2">
                    <h4 style={{ color: 'var(--text-muted)' }}>{photos.length} Photos</h4>
                    <button className="btn-outline" onClick={() => setIsAddingPhoto(!isAddingPhoto)}>
                      {isAddingPhoto ? 'Cancel' : 'Add Photo'}
                    </button>
                  </div>

                  {/* Add Photo Form */}
                  {isAddingPhoto && (
                    <form onSubmit={handleAddPhoto} className="auth-card mb-2" style={{ padding: '1.5rem', maxWidth: '100%' }}>
                      <div className="form-group">
                        <label>Photo Title</label>
                        <input type="text" className="form-control" value={newPhotoTitle} onChange={e => setNewPhotoTitle(e.target.value)} required />
                      </div>
                      <div className="form-group" style={{ position: 'relative' }}>
                        <label>Image URL (Full Size)</label>
                        <input type="url" className="form-control" value={newPhotoUrl} onChange={e => setNewPhotoUrl(e.target.value)} required />
                        <button type="button" onClick={handleGenerateRandomUrls} className="icon-btn" style={{ position: 'absolute', right: '10px', top: '32px' }} title="Generate Random Image">
                          <RefreshCw size={18} />
                        </button>
                      </div>
                      <div className="form-group">
                        <label>Thumbnail URL</label>
                        <input type="url" className="form-control" value={newPhotoThumbnail} onChange={e => setNewPhotoThumbnail(e.target.value)} required />
                      </div>
                      <button type="submit" className="btn-primary">Add to Album</button>
                    </form>
                  )}

                  {loadingPhotos ? (
                    <div className="text-center text-muted py-2">Loading photos...</div>
                  ) : (
                    <>
                      <div className="photo-grid">
                        {photos.map(photo => {
                          const isEditingP = editingPhotoId === photo.id;
                          return (
                            <div key={photo.id} className="photo-card">
                              <a href={photo.url} target="_blank" rel="noopener noreferrer">
                                <img src={photo.thumbnailUrl} alt={photo.title} className="photo-img" loading="lazy" />
                              </a>
                              <div className="photo-info">
                                {isEditingP ? (
                                  <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', marginBottom: '0.5rem' }}
                                    value={editPhotoTitle}
                                    onChange={(e) => setEditPhotoTitle(e.target.value)}
                                  />
                                ) : (
                                  <p style={{ marginBottom: '0.5rem', lineHeight: '1.2' }}>{photo.title}</p>
                                )}
                                
                                <div className="flex-between">
                                  {isEditingP ? (
                                    <button className="icon-btn success" style={{ padding: '0.25rem' }} onClick={() => handleSaveEditPhoto(photo)}><Save size={14} /></button>
                                  ) : (
                                    <button className="icon-btn" style={{ padding: '0.25rem' }} onClick={() => startEditPhoto(photo)}><Edit2 size={14} /></button>
                                  )}
                                  <button className="icon-btn danger" style={{ padding: '0.25rem' }} onClick={() => handleDeletePhoto(photo.id)}><Trash2 size={14} /></button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* PAGINATION / LOAD MORE */}
                      {photos.length === 0 && <div className="text-muted text-center mt-2">No photos in this album.</div>}
                      {hasMorePhotos && (
                        <div className="text-center mt-2 pt-2">
                          <button className="btn-outline" onClick={handleLoadMorePhotos} style={{ padding: '0.75rem 2rem' }}>
                            Load More Photos
                          </button>
                        </div>
                      )}
                    </>
                  )}

                </div>
              )}
            </div>
          );
        })}
        {filteredAlbums.length === 0 && <div className="empty-state">No albums found matching your criteria.</div>}
      </div>
    </div>
  );
}
