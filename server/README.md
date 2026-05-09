# Backend Server

This is a simple local backend based on `json-server` for the React project.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize Database:**
   This command fetches all data from `jsonplaceholder.typicode.com` and generates a local `db.json` file. It also automatically replaces the broken `via.placeholder.com` image URLs with working ones from `picsum.photos`.
   ```bash
   npm run init-db
   ```

3. **Start the Server:**
   ```bash
   npm start
   ```
   The server will run at `http://localhost:3001`.
