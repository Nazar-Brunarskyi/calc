import type { TAppBuilderErrorCode } from "./app-builder-error.type";

export interface IAppBuilderErrorProps {
  message: string;
  code: TAppBuilderErrorCode;
  status?: number;
  cause?: unknown;
}

export class AppBuilderError extends Error {
  public readonly code: TAppBuilderErrorCode;
  public readonly status: number;

  constructor(props: IAppBuilderErrorProps) {
    super(props.message);
    this.name = "AppBuilderError";
    this.code = props.code;
    this.status = props.status ?? 500;
    this.cause = props.cause;
  }
}
