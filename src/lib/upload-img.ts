import { createClient } from "@/lib/supabase/server";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET!;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadResult {
  url: string;
}

/** 上傳檔案到 Supabase Storage */
export async function uploadFile(
  file: File,
  folder: string = "general"
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("不支援的檔案格式");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("檔案大小超過 5MB");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() ?? "jpg";

  return upload(buffer, file.type, ext, folder);
}

/** 從 URL 下載圖片並上傳到 Supabase Storage */
export async function uploadFromUrl(
  imageUrl: string,
  folder: string = "general"
): Promise<UploadResult> {
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error("無法下載圖片");
  }

  const mimeType = res.headers.get("content-type") ?? "image/jpeg";
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error("不支援的圖片格式");
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_SIZE) {
    throw new Error("圖片大小超過 5MB");
  }

  const ext = mimeType.split("/")[1] === "jpeg" ? "jpg" : mimeType.split("/")[1];

  return upload(buffer, mimeType, ext, folder);
}

async function upload(
  buffer: Buffer,
  contentType: string,
  ext: string,
  folder: string
): Promise<UploadResult> {
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const supabase = createClient();

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { url: publicUrl };
}
