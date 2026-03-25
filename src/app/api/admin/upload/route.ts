import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return token === process.env.ADMIN_SECRET;
}

function downloadUrl(url: string, dest: string): Promise<boolean> {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 15000 }, (res) => {
      if (res.statusCode && [301, 302, 307].includes(res.statusCode) && res.headers.location) {
        downloadUrl(res.headers.location, dest).then(resolve);
        return;
      }
      if (res.statusCode !== 200) { resolve(false); return; }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on("finish", () => {
        stream.close();
        const size = fs.statSync(dest).size;
        if (size < 2000) { fs.unlinkSync(dest); resolve(false); return; }
        resolve(true);
      });
      stream.on("error", () => resolve(false));
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
  });
}

// POST: upload a file (multipart) or download from remote URL
export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  // JSON body = remote URL download
  if (contentType.includes("application/json")) {
    const body = await request.json();
    const { url, directory, filename } = body as { url: string; directory: string; filename: string };

    if (!url || !directory || !filename) {
      return NextResponse.json({ error: "Missing url, directory, or filename" }, { status: 400 });
    }

    // Sanitize directory to prevent path traversal
    const safeDir = directory.replace(/\.\./g, "").replace(/^\//, "");
    const destDir = path.join(process.cwd(), "public", safeDir);
    fs.mkdirSync(destDir, { recursive: true });

    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "");
    const dest = path.join(destDir, safeFilename);

    const ok = await downloadUrl(url, dest);
    if (!ok) {
      return NextResponse.json({ error: "Failed to download image" }, { status: 422 });
    }

    const publicPath = `/${safeDir}/${safeFilename}`;
    return NextResponse.json({ success: true, path: publicPath });
  }

  // Multipart form data = file upload
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const directory = formData.get("directory") as string | null;
    const filename = formData.get("filename") as string | null;

    if (!file || !directory || !filename) {
      return NextResponse.json({ error: "Missing file, directory, or filename" }, { status: 400 });
    }

    const safeDir = directory.replace(/\.\./g, "").replace(/^\//, "");
    const destDir = path.join(process.cwd(), "public", safeDir);
    fs.mkdirSync(destDir, { recursive: true });

    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "");
    const dest = path.join(destDir, safeFilename);

    const bytes = await file.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(bytes));

    const publicPath = `/${safeDir}/${safeFilename}`;
    return NextResponse.json({ success: true, path: publicPath });
  }

  return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
}
