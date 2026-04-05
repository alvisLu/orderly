import { HttpStatusCode } from "axios";

export class HttpError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}
export class DatabaseError extends HttpError {
  constructor(...args: string[]) {
    const status = 500;
    const message = `Database error: ${args[0]}`;
    const code = "0000";
    super(status, message, code);
    this.name = "DatabaseError";
  }
}

export class UnauthorizedError extends HttpError {
  constructor() {
    super(HttpStatusCode.Forbidden, "未登入或 session 已過期", "0001");
    this.name = "UnauthorizedError";
  }
}
export class ProductNotFoundError extends HttpError {
  constructor() {
    const status = 404;
    const message = "找不到產品";
    const code = "1000";
    super(status, message, code);
    this.name = "ProductNotFoundError";
  }
}

export class CategoryNotFoundError extends HttpError {
  constructor() {
    const status = 404;
    const message = "找不到目錄";
    const code = "2000";
    super(status, message, code);
    this.name = "CategoryNotFoundError";
  }
}

export class CategoryAlreadyExistsError extends HttpError {
  constructor() {
    const status = 409;
    const message = "目錄已存在";
    const code = "2001";
    super(status, message, code);
    this.name = "CategoryAlreadyExistsError";
  }
}
export class CategoryMaxCountReachedError extends HttpError {
  constructor() {
    const status = 400;
    const message = "目錄數量已達上限，最多 50 個";
    const code = "2002";
    super(status, message, code);
    this.name = "CategoryMaxCountReachedError";
  }
}

export class ProductTypeNotFoundError extends HttpError {
  constructor() {
    const status = 404;
    const message = "找不到產品選項";
    const code = "3000";
    super(status, message, code);
    this.name = "ProductTypeNotFoundError";
  }
}

export class OrderNotFoundError extends HttpError {
  constructor() {
    const status = 404;
    const message = "找不到訂單";
    const code = "4000";
    super(status, message, code);
    this.name = "OrderNotFoundError";
  }
}

export class PaymentNotFoundError extends HttpError {
  constructor() {
    const status = 404;
    const message = "找不到付款方式";
    const code = "5000";
    super(status, message, code);
    this.name = "PaymentNotFoundError";
  }
}

export class TableNotFoundError extends HttpError {
  constructor() {
    const status = 404;
    const message = "找不到桌位";
    const code = "6000";
    super(status, message, code);
    this.name = "TableNotFoundError";
  }
}
