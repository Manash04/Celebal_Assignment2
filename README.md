File Manager Tool
A simple file management tool built with Node.js core modules for creating, reading, and deleting files.
Features

✅ Create files with custom content
✅ Read and display file contents
✅ Delete files safely
✅ List all files 
✅ Interactive CLI interface

Requirements

Node.js (version 12 or higher)
No additional dependencies required
npm i

Installation

Clone or download this project
Navigate to the project directory

bashcd file-manager-tool
Usage
CLI Mode (Interactive)
bashnode fileManager.js
This will show a menu with options:

Create file
Read file
Delete file
List files
Exit

HTTP Server Mode
bashnode fileManager.js server
Server will run on http://localhost:3000
API Endpoints

GET /files - List all files
GET /files/:filename - Read a specific file
POST /files/:filename - Create a file
DELETE /files/:filename - Delete a file


