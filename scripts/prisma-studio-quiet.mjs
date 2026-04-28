/**
 * Wraps `npx prisma studio` and drops stderr blocks for Prisma Studio's known
 * benign Node stream warning (ERR_STREAM_PREMATURE_CLOSE). Other stderr is forwarded.
 */
import { spawn } from "node:child_process"

const extraArgs = process.argv.slice(2)

const child = spawn("npx", ["prisma", "studio", ...extraArgs], {
  stdio: ["inherit", "inherit", "pipe"],
  shell: true,
  env: process.env,
})

let skipPrematureCloseBlock = false
let buf = ""

function handleLine(line) {
  const isPrematureCloseStart =
    line.includes("[Prisma Studio]") &&
    line.includes("ERR_STREAM_PREMATURE_CLOSE") &&
    line.includes("Premature close")

  if (isPrematureCloseStart) {
    skipPrematureCloseBlock = true
    return
  }

  if (skipPrematureCloseBlock) {
    if (line.trim() === "}") skipPrematureCloseBlock = false
    return
  }

  process.stderr.write(line + "\n")
}

child.stderr.on("data", (chunk) => {
  buf += chunk.toString("utf8")
  let nl
  while ((nl = buf.indexOf("\n")) !== -1) {
    const raw = buf.slice(0, nl)
    buf = buf.slice(nl + 1)
    handleLine(raw.replace(/\r$/, ""))
  }
})

child.stderr.on("end", () => {
  if (buf.length) handleLine(buf.replace(/\r$/, ""))
})

child.on("exit", (code, sig) => {
  process.exit(code ?? (sig ? 1 : 0))
})
