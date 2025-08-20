import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { hash } from "bcryptjs"

const USERS_FILE = path.join(process.cwd(), "data", "users.json")

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, password, role, team } = body
    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const data = await readUsers()
    const exists = data.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
    if (exists) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }
    const passwordHash = await hash(String(password), 10)
    const user = {
      id: Date.now().toString(),
      email,
      name: `${firstName || ""} ${lastName || ""}`.trim() || email,
      role: role === "manager" ? "manager" : "developer",
      team: team || "",
      passwordHash,
    }
    data.push(user)
    await writeUsers(data)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

async function readUsers() {
  try {
    const json = await fs.readFile(USERS_FILE, "utf8")
    return JSON.parse(json)
  } catch (err) {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true })
    await fs.writeFile(USERS_FILE, "[]", "utf8")
    return []
  }
}

async function writeUsers(users: any[]) {
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true })
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8")
}


