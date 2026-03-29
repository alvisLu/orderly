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

export class ProductNotFoundError extends HttpError {
  constructor() {
    const status = 404;
    const message = "Product not found";
    const code = "1000";
    super(status, message, code);
    this.name = "ProductNotFoundError";
  }
}

export class CategoryNotFoundError extends HttpError {
  constructor() {
    const status = 404;
    const message = "Category not found";
    const code = "2000";
    super(status, message, code);
    this.name = "CategoryNotFoundError";
  }
}

export class CategoryAlreadyExistsError extends HttpError {
  constructor() {
    const status = 409;
    const message = "Category already exists";
    const code = "2001";
    super(status, message, code);
    this.name = "CategoryAlreadyExistsError";
  }
}

export class ProductTypeNotFoundError extends HttpError {
  constructor() {
    const status = 404;
    const message = "Product type not found";
    const code = "3000";
    super(status, message, code);
    this.name = "ProductTypeNotFoundError";
  }
}

export class OrderNotFoundError extends HttpError {
  constructor() {
    const status = 404;
    const message = "Order not found";
    const code = "4000";
    super(status, message, code);
    this.name = "OrderNotFoundError";
  }
}

export class PaymentNotFoundError extends HttpError {
  constructor() {
    const status = 404;
    const message = "Payment not found";
    const code = "5000";
    super(status, message, code);
    this.name = "PaymentNotFoundError";
  }
}

