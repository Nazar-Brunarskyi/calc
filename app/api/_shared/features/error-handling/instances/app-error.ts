interface IAppErrorProps {
  message: string;
  statusCode?: number;
  code?: string;
}

export class AppError extends Error {
  readonly statusCode: number;
  readonly code?: string;

  constructor({ message, statusCode = 500, code }: IAppErrorProps) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
