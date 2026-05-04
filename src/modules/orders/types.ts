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
  gateway?: Gateway;
};

export type UpdateOrderInput = {
  status?: OrderStatus;
  financialStatus?: OrderFinancialStatus;
  fulfillmentStatus?: OrderFulfillmentStatus;
  note?: string;
  isDining?: boolean;
  userPhone?: string;
  userNote?: string;
  gateway?: Gateway;
};

export interface OrderQuery {
  status?: OrderStatus;
  isDining?: boolean;
  sort?: "asc" | "desc";
  page: number;
  limit: number;
  showDeleted?: boolean;
  from?: Date;
  to?: Date;
}

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface OrderStatsQuery {
  from?: Date;
  to?: Date;
  showDeleted?: boolean;
}

export interface GatewayAmount {
  name: string;
  amount: number;
}

export interface OrderStats {
  count: number;
  total: number;
  doneTotal: number;
  cancelledTotal: number;
  unfinishedTotal: number;
  processingCount: number;
  paidTotal: number;
  discount: number;
  refundTotal: number;
  peopleCount: number;
  avgPerOrder: number;
  avgPerPerson: number;
  byGateway: GatewayAmount[];
}
