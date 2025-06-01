const fs = require("fs");
const path = require("path");
const http = require("http");
const url = require("url");

class FileManager {
  constructor(baseDir = "./files") {
    this.baseDir = baseDir;
    this.ensureBaseDirectory();
  }

  ensureBaseDirectory() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
      console.log(`Created base directory: ${this.baseDir}`);
    }
  }

  createFile(filename, content = "") {
    try {
      const filePath = path.join(this.baseDir, filename);

      if (fs.existsSync(filePath)) {
        return { success: false, message: `File '${filename}' already exists` };
      }

      fs.writeFileSync(filePath, content, "utf8");
      return {
        success: true,
        message: `File '${filename}' created successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error creating file: ${error.message}`,
      };
    }
  }

  readFile(filename) {
    try {
      const filePath = path.join(this.baseDir, filename);

      if (!fs.existsSync(filePath)) {
        return { success: false, message: `File '${filename}' not found` };
      }

      const content = fs.readFileSync(filePath, "utf8");
      return {
        success: true,
        content,
        message: `File '${filename}' read successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error reading file: ${error.message}`,
      };
    }
  }

  deleteFile(filename) {
    try {
      const filePath = path.join(this.baseDir, filename);

      if (!fs.existsSync(filePath)) {
        return { success: false, message: `File '${filename}' not found` };
      }

      fs.unlinkSync(filePath);
      return {
        success: true,
        message: `File '${filename}' deleted successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error deleting file: ${error.message}`,
      };
    }
  }

  listFiles() {
    try {
      const files = fs.readdirSync(this.baseDir);
      const fileStats = files.map((file) => {
        const filePath = path.join(this.baseDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          isDirectory: stats.isDirectory(),
        };
      });
      return { success: true, files: fileStats };
    } catch (error) {
      return {
        success: false,
        message: `Error listing files: ${error.message}`,
      };
    }
  }
}

class FileManagerServer {
  constructor(fileManager, port = 3000) {
    this.fileManager = fileManager;
    this.port = port;
    this.server = null;
  }

  start() {
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    this.server.listen(this.port, () => {
      console.log(
        `File Manager Server running at http://localhost:${this.port}`
      );
      console.log("\nAvailable endpoints:");
      console.log("GET /files - List all files");
      console.log("GET /files/:filename - Read a file");
      console.log(
        "POST /files/:filename - Create a file (send content in body)"
      );
      console.log("DELETE /files/:filename - Delete a file");
    });
  }

  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const pathname = parsedUrl.pathname;

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    if (pathname === "/files" && method === "GET") {
      this.handleListFiles(res);
    } else if (pathname.startsWith("/files/")) {
      const filename = pathname.split("/files/")[1];
      if (!filename) {
        this.sendResponse(res, 400, { error: "Filename is required" });
        return;
      }

      switch (method) {
        case "GET":
          this.handleReadFile(res, filename);
          break;
        case "POST":
          this.handleCreateFile(req, res, filename);
          break;
        case "DELETE":
          this.handleDeleteFile(res, filename);
          break;
        default:
          this.sendResponse(res, 405, { error: "Method not allowed" });
      }
    } else {
      this.sendResponse(res, 404, { error: "Endpoint not found" });
    }
  }

  handleListFiles(res) {
    const result = this.fileManager.listFiles();
    if (result.success) {
      this.sendResponse(res, 200, { files: result.files });
    } else {
      this.sendResponse(res, 500, { error: result.message });
    }
  }

  handleReadFile(res, filename) {
    const result = this.fileManager.readFile(filename);
    if (result.success) {
      this.sendResponse(res, 200, {
        filename,
        content: result.content,
        message: result.message,
      });
    } else {
      this.sendResponse(res, 404, { error: result.message });
    }
  }

  handleCreateFile(req, res, filename) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const result = this.fileManager.createFile(filename, body);
      if (result.success) {
        this.sendResponse(res, 201, {
          filename,
          message: result.message,
        });
      } else {
        this.sendResponse(res, 400, { error: result.message });
      }
    });
  }

  handleDeleteFile(res, filename) {
    const result = this.fileManager.deleteFile(filename);
    if (result.success) {
      this.sendResponse(res, 200, {
        filename,
        message: result.message,
      });
    } else {
      this.sendResponse(res, 404, { error: result.message });
    }
  }

  sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data, null, 2));
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log("Server stopped");
    }
  }
}

class FileManagerCLI {
  constructor(fileManager) {
    this.fileManager = fileManager;
  }

  showMenu() {
    console.log("\n=== File Manager CLI ===");
    console.log("1. Create file");
    console.log("2. Read file");
    console.log("3. Delete file");
    console.log("4. List files");
    console.log("5. Start HTTP server");
    console.log("6. Exit");
    console.log("========================");
  }

  async getUserInput(prompt) {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      readline.question(prompt, (answer) => {
        readline.close();
        resolve(answer.trim());
      });
    });
  }

  async run() {
    while (true) {
      this.showMenu();
      const choice = await this.getUserInput("Enter your choice (1-6): ");

      switch (choice) {
        case "1":
          await this.createFilePrompt();
          break;
        case "2":
          await this.readFilePrompt();
          break;
        case "3":
          await this.deleteFilePrompt();
          break;
        case "4":
          this.listFilesPrompt();
          break;
        case "5":
          await this.startServerPrompt();
          break;
        case "6":
          console.log("Goodbye!");
          process.exit(0);
          break;
        default:
          console.log("Invalid choice. Please try again.");
      }
    }
  }

  async createFilePrompt() {
    const filename = await this.getUserInput("Enter filename: ");
    const content = await this.getUserInput(
      "Enter file content (press Enter for empty): "
    );

    const result = this.fileManager.createFile(filename, content);
    console.log(result.message);
  }

  async readFilePrompt() {
    const filename = await this.getUserInput("Enter filename to read: ");

    const result = this.fileManager.readFile(filename);
    if (result.success) {
      console.log(`\nContent of '${filename}':`);
      console.log("---");
      console.log(result.content);
      console.log("---");
    } else {
      console.log(result.message);
    }
  }

  async deleteFilePrompt() {
    const filename = await this.getUserInput("Enter filename to delete: ");

    const result = this.fileManager.deleteFile(filename);
    console.log(result.message);
  }

  listFilesPrompt() {
    const result = this.fileManager.listFiles();
    if (result.success) {
      console.log("\nFiles in directory:");
      console.log("---");
      if (result.files.length === 0) {
        console.log("No files found.");
      } else {
        result.files.forEach((file) => {
          const type = file.isDirectory ? "[DIR]" : "[FILE]";
          console.log(
            `${type} ${file.name} (${file.size} bytes, modified: ${file.modified})`
          );
        });
      }
      console.log("---");
    } else {
      console.log(result.message);
    }
  }

  async startServerPrompt() {
    const port =
      (await this.getUserInput("Enter port (default 3000): ")) || "3000";
    const server = new FileManagerServer(this.fileManager, parseInt(port));
    server.start();

    console.log("\nPress Ctrl+C to stop the server and return to CLI");

    process.on("SIGINT", () => {
      server.stop();
      console.log("\nReturning to CLI...");
      this.run();
    });
  }
}

if (require.main === module) {
  const fileManager = new FileManager("./files");

  const args = process.argv.slice(2);

  if (args[0] === "server") {
    const port = args[1] ? parseInt(args[1]) : 3000;
    const server = new FileManagerServer(fileManager, port);
    server.start();
  } else {
    const cli = new FileManagerCLI(fileManager);
    cli.run();
  }
}

module.exports = { FileManager, FileManagerServer, FileManagerCLI };
