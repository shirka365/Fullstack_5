const fs = require('fs');

async function initDB() {
  const baseUrl = 'https://jsonplaceholder.typicode.com';
  const endpoints = ['users', 'posts', 'comments', 'albums', 'photos', 'todos'];
  const db = {};

  console.log('Starting data fetch from jsonplaceholder...');

  for (const endpoint of endpoints) {
      console.log(`Fetching ${endpoint}...`);
      const response = await fetch(`${baseUrl}/${endpoint}`);
      let data = await response.json();

      if (endpoint === 'photos') {
          // Replace placeholder URLs with actual images from picsum.photos.
          // We use modulo 1000 since picsum has a limited set of IDs.
          data = data.map(photo => ({
              ...photo,
              url: `https://picsum.photos/id/${photo.id % 1000}/600/600`,
              thumbnailUrl: `https://picsum.photos/id/${photo.id % 1000}/150/150`
          }));
      }

      db[endpoint] = data;
  }

  fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
  console.log('db.json created successfully with replaced image URLs!');
}

initDB().catch(console.error);
