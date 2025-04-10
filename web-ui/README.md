# Claude Task Master Web UI

A modern web interface for the Claude Task Master task management system.

## Features

- 📊 Dashboard with task statistics and progress overview
- 📝 Complete task listing with filtering and search
- 🔍 Detailed task view with status management
- ✨ AI-powered subtask generation
- 🚀 Modern, responsive UI that works on desktop and mobile

## Installation

Clone the Claude Task Master repository and install dependencies:

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/eyaltoledano/claude-task-master.git
cd claude-task-master

# Install the main package dependencies
npm install

# Install the web UI dependencies
npm run web:install
```

## Configuration

Make sure you have a valid `.env` file in the root directory with your Anthropic API key:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Additional optional environment variables:

```
MODEL=claude-3-7-sonnet-20250219
PORT=3000  # Port for the web UI server
```

## Usage

### Development Mode

To run the web UI in development mode with hot reloading, you'll need to run two separate processes:

#### Terminal 1: API Server

```bash
cd claude-task-master/web-ui
npm run dev:server
```

This starts the API server on port 3000.

#### Terminal 2: Vite Development Server

```bash
cd claude-task-master/web-ui
npm run dev:client
```

This starts the Vite development server on port 5173 with hot reloading.

You can then access the application at http://localhost:5173, which will proxy API requests to the server running on port 3000.

### Production Mode

To build and run the web UI in production mode:

```bash
# Build the web UI
npm run web:build

# Start the server
npm run web:start
```

The application will be available at http://localhost:3000 (or the port specified in your environment variables).

## API Endpoints

The web UI communicates with the following API endpoints:

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a specific task by ID
- `PATCH /api/tasks/:id/status` - Update a task's status
- `POST /api/tasks/:id/expand` - Generate subtasks for a task
- `GET /api/next-task` - Get the next task to work on
- `POST /api/tasks` - Create a new task

## Project Structure

```
web-ui/
├── public/             # Static assets
├── src/                # Source code
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Application entry point
├── server.js           # Express API server
├── vite.config.js      # Vite configuration
└── package.json        # Project dependencies and scripts
```

## Troubleshooting

### API and Client Connection Issues

If you experience issues connecting the client to the API:

1. Make sure both the API server and Vite client are running
2. Check that the proxy in vite.config.js is correctly set to http://localhost:3000
3. Verify that the port 3000 is not being used by another application

### Import Errors

If you see errors related to missing modules or default exports:

1. Ensure you've installed all dependencies with `npm run web:install`
2. Check that the module imports in server.js match the export style of imported modules

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 