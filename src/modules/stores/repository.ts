import { prisma } from "@/lib/prisma";
import { DatabaseError } from "@/lib/http-error";
import type { Store, UpdateStoreInput } from "./types";

export async function findFirstStore(): Promise<Store | null> {
  try {
    return await prisma.store.findFirst();
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function updateStore(
  id: string,
  input: UpdateStoreInput
): Promise<Store | null> {
  try {
    return await prisma.store.update({ where: { id }, data: input });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}
