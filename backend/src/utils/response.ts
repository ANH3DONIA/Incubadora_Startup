import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: any;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data?: T,
  message?: string,
  pagination?: ApiResponse['pagination']
) => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    ...(message ? { message } : {}),
    ...(data !== undefined ? { data } : {}),
    ...(pagination ? { pagination } : {}),
  });
};
