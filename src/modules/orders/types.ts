import type {
  Prisma,
  OrderStatus,
  OrderFinancialStatus,
  OrderFulfillmentStatus,
} from "@/generated/prisma/client";

export type OrderSource = "store" | "qrcode" | "online";

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
  name: string;
  cost: number;
  productOptions: LineItemOption[];
};

export type Gateway = {
  id: string;
  name: string;
};

export type TransactionType = "checkout" | "refund";

export type OrderTransactionInput = {
  type: TransactionType;
  amount: number;
  gateway: Gateway;
  note?: string;
};

export type CreateOrderInput = {
  items: CreateOrderItemInput[];
  discount: number;
  note?: string;
  isDining?: boolean;
  userPhone?: string;
  userNote?: string;
  tableName?: string;
  source: OrderSource;
  financialStatus?: OrderFinancialStatus;
  fulfillmentStatus?: OrderFulfillmentStatus;
  transaction?: OrderTransactionInput;
};

export type UpdateOrderInput = {
  status?: OrderStatus;
  financialStatus?: OrderFinancialStatus;
  fulfillmentStatus?: OrderFulfillmentStatus;
  note?: string;
  isDining?: boolean;
  userPhone?: string;
  userNote?: string;
  transaction?: OrderTransactionInput;
};

export interface OrderQuery {
  status?: OrderStatus;
  isDining?: boolean;
  page: number;
  limit: number;
  showDeleted?: boolean;
}

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}
