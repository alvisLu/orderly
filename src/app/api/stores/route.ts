import { getStore, editStore } from "@/modules/stores/service";
import { authRouteHandler } from "@/lib/route-handler";
import { updateStoreDto } from "@/modules/stores/dto";

export const GET = authRouteHandler(async () => {
  const store = await getStore();
  return Response.json(store);
});

export const PATCH = authRouteHandler(async (request) => {
  const store = await getStore();
  const body = updateStoreDto.parse(await request.json());
  const updated = await editStore(store.id, body);
  return Response.json(updated);
});
