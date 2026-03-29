export interface IPostTestBodyValidationRequestDto {
  message: string;
  text?: string | null;
}

export interface IPostTestBodyValidationResponseDto {
  echoed: string;
}
