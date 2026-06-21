import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const TEMP_DIR = path.resolve("backend/temp_exec");

// Clean up any left-over temp directories from a previous crashed run
if (fs.existsSync(TEMP_DIR)) {
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch (err) {
    console.error("Failed to clean TEMP_DIR at startup:", err);
  }
}
fs.mkdirSync(TEMP_DIR, { recursive: true });

export const runCode = async (language, code, stdin = "") => {
  const id = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const runDir = path.join(TEMP_DIR, `run_${id}`);
  
  fs.mkdirSync(runDir, { recursive: true });

  let cmd = "";
  let args = [];
  let compileCmd = "";
  let compileArgs = [];
  let mainFile = "";

  try {
    if (language === "javascript") {
      mainFile = "index.js";
      fs.writeFileSync(path.join(runDir, mainFile), code);
      cmd = "node";
      args = [mainFile];
    } else if (language === "python") {
      mainFile = "index.py";
      fs.writeFileSync(path.join(runDir, mainFile), code);
      cmd = "python3";
      args = [mainFile];
    } else if (language === "cpp") {
      mainFile = "index.cpp";
      fs.writeFileSync(path.join(runDir, mainFile), code);
      compileCmd = "g++";
      compileArgs = ["-O2", "-I../../include", "index.cpp", "-o", "index.out"];
      cmd = "./index.out";
      args = [];
    } else if (language === "java") {
      const classMatch = code.match(/public\s+class\s+([a-zA-Z0-9_$]+)/) || code.match(/class\s+([a-zA-Z0-9_$]+)/);
      const className = classMatch ? classMatch[1] : "Main";
      mainFile = `${className}.java`;
      fs.writeFileSync(path.join(runDir, mainFile), code);
      compileCmd = "javac";
      compileArgs = [mainFile];
      cmd = "java";
      args = [className];
    } else {
      throw new Error(`Unsupported language: ${language}`);
    }

    // 1. Compile phase if required
    if (compileCmd) {
      const compileResult = await runProcess(compileCmd, compileArgs, runDir, "", 10000); // 10s compile limit
      if (compileResult.code !== 0) {
        return {
          success: false,
          output: compileResult.stderr || "Compilation failed with code " + compileResult.code,
          isCompileError: true
        };
      }
    }

    // 2. Run phase
    const runResult = await runProcess(cmd, args, runDir, stdin, 5000); // 5s runtime limit
    return {
      success: runResult.code === 0,
      output: runResult.stdout + runResult.stderr,
      code: runResult.code,
      timeout: runResult.timeout
    };

  } catch (error) {
    return {
      success: false,
      output: error.message
    };
  } finally {
    // Cleanup run directory
    try {
      fs.rmSync(runDir, { recursive: true, force: true });
    } catch (e) {
      console.error("Cleanup error:", e);
    }
  }
};

const runProcess = (cmd, args, cwd, stdin, timeoutMs) => {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let resolved = false;

    const child = spawn(cmd, args, { cwd });

    // Write input to stdin and close it
    if (stdin) {
      child.stdin.write(stdin);
    }
    child.stdin.end();

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        child.kill("SIGKILL");
        resolve({
          code: null,
          stdout,
          stderr: stderr + "\nExecution Timed Out (Limit: 5s)",
          timeout: true
        });
      }
    }, timeoutMs);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
      // Safeguard: Limit stdout buffer size to 64KB
      if (stdout.length > 65536) {
        stdout = stdout.substring(0, 65536) + "\n... [Output Truncated]";
        child.kill();
      }
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
      if (stderr.length > 65536) {
        stderr = stderr.substring(0, 65536) + "\n... [Stderr Truncated]";
        child.kill();
      }
    });

    child.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({
          code: -1,
          stdout,
          stderr: stderr + `\nProcess Error: ${err.message}`
        });
      }
    });

    child.on("close", (code) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({
          code,
          stdout,
          stderr
        });
      }
    });
  });
};
