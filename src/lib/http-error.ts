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
