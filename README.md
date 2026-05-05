# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Node.js (Backend)
- MySQL (Database)

## Local Development Setup

To run this project locally with full functionality, you'll need to set up the backend and database.

### Prerequisites

- Node.js & npm (install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- MySQL Server (install from [MySQL official site](https://dev.mysql.com/downloads/mysql/) or use a package manager)

### Backend Setup

1. **Install MySQL and create database:**
   ```sh
   # Install MySQL (Ubuntu/Debian)
   sudo apt update
   sudo apt install mysql-server

   # Or for macOS with Homebrew
   brew install mysql
   brew services start mysql

   # Or for Windows, download from MySQL website

   # Start MySQL service and create database
   sudo mysql -u root -p
   CREATE DATABASE r_genzgifts;
   EXIT;
   ```

2. **Set up environment variables:**
   Create a `.env` file in the `backend/` directory:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=r_genzgifts
   DB_PORT=3306
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=1h
   ```

3. **Run the database setup script:**
   ```sh
   cd backend
   mysql -u root -p r_genzgifts < create_tables.sql
   ```

4. **Install backend dependencies and start server:**
   ```sh
   cd backend
   npm install
   npm start
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Start the development server:**
   ```sh
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

### Running Both Together

To run both frontend and backend simultaneously:

```sh
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
npm run dev
```

The application will be available at `http://localhost:5173` with full database functionality.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
