import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("=====================================================================");
console.log("⚡ KHỞI CHẠY HỆ THỐNG ĐỐI TÁC VẬN CHUYỂN FASTSHIP EXPRESS ⚡");
console.log("   • Backend API : http://localhost:8081");
console.log("   • Frontend Web: http://localhost:8082");
console.log("=====================================================================\n");

const backend = spawn(process.execPath, [path.join(__dirname, "backend", "server.mjs")], {
  stdio: "inherit"
});

const frontend = spawn(process.execPath, [path.join(__dirname, "frontend", "server.mjs")], {
  stdio: "inherit"
});

process.on("SIGINT", () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});
