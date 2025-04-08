# 3D PLY Viewer

A web-based 3D viewer for PLY files using Three.js and Vite.

## Prerequisites

Before you begin, ensure you have installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone this repository or download the files

```bash
git clone <repository-url>
```

2. Navigate to the project directory

```bash
cd threedee
```

3. Install dependencies

```bash
npm install
```

## Project Structure

````

## Development Server

To run the project locally:

1. Start the development server:
```bash
npm start
````

2. Open your browser and navigate to:
   - http://localhost:5173 (default Vite port)
   - Or the URL shown in your terminal

The development server features:

- Hot Module Replacement (HMR)
- Auto-reloading on file changes
- Error overlay
- Network access via your local IP (useful for testing on other devices)

To access from other devices on your network:

```bash
npm start -- --host
```

## Controls

- **Rotate**: Left-click and drag
- **Pan**: Right-click and drag
- **Zoom**: Mouse wheel scroll

## Building for Production

To create a production build:

```bash
npm run build
```

This will create a `dist` directory with the built files.

To preview the production build:

```bash
npm run preview
```

## Adding Your Own PLY Files

1. Place your PLY file in the `public` directory
2. Update the file path in `src/main.js`:

```javascript
loader.load(
  "/your-file-name.ply"
  // ... rest of the code
);
```

## Technologies Used

- [Three.js](https://threejs.org/) - 3D graphics library
- [Vite](https://vitejs.dev/) - Frontend build tool
- [PLYLoader](https://threejs.org/docs/#examples/en/loaders/PLYLoader) - Three.js PLY file loader

## License

ISC

## Author

Harry Pujols
