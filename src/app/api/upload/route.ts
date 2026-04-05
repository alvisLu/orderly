import { uploadFile, uploadFromUrl } from "@/lib/upload-img";
import { authRouteHandler } from "@/lib/route-handler";

export const POST = authRouteHandler(async (request) => {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) ?? "general";

    if (!file) {
      return Response.json({ error: "缺少檔案" }, { status: 400 });
    }

    const result = await uploadFile(file, folder);
    return Response.json(result);
  }

  const body = await request.json();
  const { url, folder } = body as { url: string; folder?: string };

  if (!url) {
    return Response.json({ error: "缺少 url" }, { status: 400 });
  }

  const result = await uploadFromUrl(url, folder);
  return Response.json(result);
});
