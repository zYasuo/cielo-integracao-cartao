export interface IZeroAuthResponse {
  Valid: boolean;
  ReturnCode: string;
  ReturnMessage: string;
  IssuerTransactionId: string;
}


export interface IZeroAuthErrorResponse {
  Code: number;
  Message: string;
}

export type TZeroAuthApiResponse = IZeroAuthResponse | IZeroAuthErrorResponse;

