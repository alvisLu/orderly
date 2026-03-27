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

export class ProductNotFoundError extends HttpError {
  constructor() {
    const status = 404;
    const message = "Product not found";
    const code = "0000";
    super(status, message, code);
    this.name = "ProductNotFoundError";
  }
}
