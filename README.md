📁 File Manager Tool
A simple and efficient file management tool built using Node.js core modules. This tool allows you to create, read, delete, and list files via a command-line interface (CLI) or a RESTful HTTP server—no external dependencies required!

🚀 Features
✅ Create files with custom content

📖 Read and display file contents

🗑️ Delete files safely

📂 List all files with metadata

💻 Interactive CLI interface

🌐 HTTP server with REST API support

📦 Requirements
Node.js (version 12 or higher)

No external dependencies

Optional: npm install (if future improvements add packages)

🔧 Installation
Clone the repository:

bash
Copy
Edit
git clone https://github.com/your-username/file-manager-tool.git
Navigate to the project directory:

bash
Copy
Edit
cd file-manager-tool
🖥️ Usage
✅ CLI Mode (Interactive)
Run the following command:

bash
Copy
Edit
node fileManager.js
You’ll see an interactive menu with options:

markdown
Copy
Edit
1. Create file
2. Read file
3. Delete file
4. List files
5. Exit
🌐 HTTP Server Mode
Start the server with:

bash
Copy
Edit
node fileManager.js server
The server will run at:
📍 http://localhost:3000

📡 API Endpoints
Method	Endpoint	Description
GET	/files	List all files
GET	/files/:filename	Read a specific file
POST	/files/:filename	Create a new file
DELETE	/files/:filename	Delete a specific file

🔒 All file operations are scoped to the local project directory for safety.

