import apiClient from "@/lib/api-client";

/** 上傳檔案到 Supabase Storage */
export async function apiUploadFile(
  file: File,
  folder: string
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const { data } = await apiClient.post<{ url: string }>("/upload", form);
  return data.url;
}

/** 透過 URL 上傳圖片到 Supabase Storage */
export async function apiUploadFromUrl(
  url: string,
  folder: string
): Promise<string> {
  const { data } = await apiClient.post<{ url: string }>("/upload", {
    url,
    folder,
  });
  return data.url;
}
