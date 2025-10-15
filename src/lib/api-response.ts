// API Response utilities following Astro best practices
// Provides consistent error/success response formatting

interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string;
  field?: string;
  allErrors?: Array<{ field: string; message: string }>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a successful JSON response
 */
export function jsonSuccess<T>(data: T, status = 200): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data
    } satisfies ApiSuccessResponse<T>),
    {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Create an error JSON response
 */
export function jsonError(
  error: string,
  details?: string,
  status = 400,
  additionalData?: { field?: string; allErrors?: Array<{ field: string; message: string }> }
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error,
      details,
      ...additionalData
    } satisfies ApiErrorResponse),
    {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Common error responses
 */
export const ApiErrors = {
  badRequest: (details?: string) => 
    jsonError('Bad Request', details, 400),
  
  unauthorized: (details?: string) => 
    jsonError('Unauthorized', details, 401),
  
  forbidden: (details?: string) => 
    jsonError('Forbidden', details, 403),
  
  notFound: (details?: string) => 
    jsonError('Not Found', details, 404),
  
  validationFailed: (details: string, field?: string, allErrors?: Array<{ field: string; message: string }>) =>
    jsonError('Validation Failed', details, 400, { field, allErrors }),
  
  serverError: (details?: string) => 
    jsonError('Internal Server Error', details, 500),
  
  invalidJson: () => 
    jsonError('Invalid JSON', 'Request body contains invalid JSON', 400),
  
  missingBody: () => 
    jsonError('Missing Request Body', 'Request body is required', 400)
};
