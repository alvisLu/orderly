import type {
  Prisma,
  OrderStatus,
  OrderFinancialStatus,
  OrderFulfillmentStatus,
} from "@/generated/prisma/client";

export type Order = Prisma.OrderGetPayload<{
  include: { lineItems: { include: { product: true } } };
}>;

export type LineItemOption = {
  name: string;
  price: number;
  quantity: number;
  productTypeName: string;
};

export type CreateOrderItemInput = {
  rank: number;
  productId: string;
  quantity: number;
  price: number;
  originalPrice: number;
  productOptions: LineItemOption[];
};

export type CreateOrderInput = {
  items: CreateOrderItemInput[];
  discount: number;
  note?: string;
  isDining?: boolean;
  userPhone?: string;
  userNote?: string;
  source?: string;
};

export type UpdateOrderInput = {
  status?: OrderStatus;
  financialStatus?: OrderFinancialStatus;
  fulfillmentStatus?: OrderFulfillmentStatus;
  note?: string;
  isDining?: boolean;
  userPhone?: string;
  userNote?: string;
};

export interface OrderQuery {
  status?: OrderStatus;
  page: number;
  limit: number;
}

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}
