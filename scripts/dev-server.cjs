const fs = require("fs");
const path = require("path");
const { spawn, execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const pidFile = path.join(root, ".dev-server.pid");
const port = 4000;

function readPid() {
  if (!fs.existsSync(pidFile)) return null;
  const text = fs.readFileSync(pidFile, "utf8").trim();
  const pid = Number(text);
  return Number.isInteger(pid) && pid > 0 ? pid : null;
}

function writePid(pid) {
  fs.writeFileSync(pidFile, `${pid}\n`, "utf8");
}

function removePid() {
  if (fs.existsSync(pidFile)) fs.unlinkSync(pidFile);
}

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function detectListeningPid() {
  try {
    const output = execFileSync("cmd.exe", ["/c", `netstat -ano | findstr :${port}`], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });

    const lines = output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => line.includes("LISTENING"));

    for (const line of lines) {
      const parts = line.split(/\s+/);
      const pid = Number(parts[parts.length - 1]);
      if (Number.isInteger(pid) && pid > 0) {
        return pid;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function start() {
  const existingFromPort = detectListeningPid();
  if (existingFromPort) {
    writePid(existingFromPort);
    console.log(`Port ${port} is already in use by PID ${existingFromPort}.`);
    return;
  }

  const powershell = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
  const child = spawn(powershell, ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "& \"$env:ProgramFiles\\nodejs\\npm.cmd\" run dev"], {
    cwd: root,
    detached: false,
    stdio: "ignore",
    windowsHide: true
  });

  child.unref();

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const pid = detectListeningPid();
    if (pid) {
      writePid(pid);
      console.log(`Started dev server on port ${port} with PID ${pid}.`);
      return;
    }
    await sleep(1000);
  }

  console.error(`Failed to detect a dev server listening on port ${port}.`);
  process.exitCode = 1;
}

function stop() {
  const pid = readPid();
  if (!pid) {
    console.log("No dev server PID file found.");
    return;
  }

  try {
    execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
      cwd: root,
      stdio: ["ignore", "ignore", "ignore"]
    });
    console.log(`Stopped dev server tree with PID ${pid}.`);
  } catch {
    if (isProcessRunning(pid)) {
      console.log(`Unable to stop process ${pid}.`);
      process.exitCode = 1;
      return;
    }
    console.log(`Process ${pid} was already stopped.`);
  } finally {
    removePid();
  }
}

async function main() {
  const command = process.argv[2];
  if (command === "start") {
    await start();
    return;
  }
  if (command === "stop") {
    stop();
    return;
  }

  console.error("Usage: node scripts/dev-server.cjs <start|stop>");
  process.exitCode = 1;
}

main();




