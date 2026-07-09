"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { productSchema, stockMovementSchema } from "@/lib/validations/product";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  const user = await getCurrentUser();
  return prisma.product.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { name: "asc" },
  });
}

export async function createProduct(formData: unknown) {
  const user = await getCurrentUser();
  const parsed = productSchema.parse(formData);

  const product = await prisma.product.create({
    data: {
      organizationId: user.organizationId,
      sku: parsed.sku,
      name: parsed.name,
      description: parsed.description || null,
      purchasePrice: parsed.purchasePrice,
      salePrice: parsed.salePrice,
      stockQuantity: parsed.stockQuantity,
      stockThreshold: parsed.stockThreshold,
      category: parsed.category || null,
    },
  });

  await prisma.activityLog.create({
    data: {
      organizationId: user.organizationId,
      userId: user.id,
      action: "CREATE",
      entity: "Product",
      entityId: product.id,
      details: `Produit "${product.name}" cree`,
    },
  });

  revalidatePath("/stock");
  revalidatePath("/dashboard");
  return product;
}

export async function deleteProduct(id: string) {
  const user = await getCurrentUser();
  await prisma.product.deleteMany({
    where: { id, organizationId: user.organizationId },
  });
  revalidatePath("/stock");
  revalidatePath("/dashboard");
}

export async function createStockMovement(formData: unknown) {
  const user = await getCurrentUser();
  const parsed = stockMovementSchema.parse(formData);

  const product = await prisma.product.findFirst({
    where: { id: parsed.productId, organizationId: user.organizationId },
  });
  if (!product) throw new Error("Produit introuvable");

  const delta =
    parsed.type === "IN" ? parsed.quantity : parsed.type === "OUT" ? -parsed.quantity : parsed.quantity;
  const newQuantity = Math.max(0, product.stockQuantity + delta);

  await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        organizationId: user.organizationId,
        productId: parsed.productId,
        type: parsed.type,
        quantity: parsed.quantity,
        reason: parsed.reason || null,
      },
    }),
    prisma.product.update({
      where: { id: parsed.productId },
      data: { stockQuantity: newQuantity },
    }),
  ]);

  await prisma.activityLog.create({
    data: {
      organizationId: user.organizationId,
      userId: user.id,
      action: "STOCK_MOVEMENT",
      entity: "Product",
      entityId: parsed.productId,
      details: `Mouvement de stock ${parsed.type} de ${parsed.quantity} sur "${product.name}"`,
    },
  });

  revalidatePath("/stock");
  revalidatePath("/dashboard");
}
