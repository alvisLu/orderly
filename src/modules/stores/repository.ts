import { prisma } from "@/lib/prisma";
import { DatabaseError } from "@/lib/http-error";
import type { Store as PrismaStore, Prisma } from "@/generated/prisma/client";
import {
  EMPTY_OPENING,
  type Opening,
  type Store,
  type UpdateStoreInput,
} from "./types";

function normalizeOpening(value: Prisma.JsonValue | null): Opening {
  if (
    value === null ||
    value === undefined ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return EMPTY_OPENING;
  }
  return value as unknown as Opening;
}

function normalizeStore(row: PrismaStore): Store {
  return { ...row, opening: normalizeOpening(row.opening) };
}

export async function findFirstStore(): Promise<Store | null> {
  try {
    const row = await prisma.store.findFirst();
    return row ? normalizeStore(row) : null;
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function updateStore(
  id: string,
  input: UpdateStoreInput
): Promise<Store | null> {
  try {
    const row = await prisma.store.update({
      where: { id },
      data: input as Prisma.StoreUpdateInput,
    });
    return normalizeStore(row);
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}
