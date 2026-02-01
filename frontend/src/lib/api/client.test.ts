import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { isApiError, getErrorMessage } from './client';

describe('isApiError', () => {
  it('should return true for AxiosError', () => {
    const error = new AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 400,
        statusText: 'Bad Request',
        data: { error: 'Validation failed' },
        headers: {},
        config: { headers: new AxiosHeaders() },
      }
    );

    expect(isApiError(error)).toBe(true);
  });

  it('should return false for regular Error', () => {
    const error = new Error('Regular error');
    expect(isApiError(error)).toBe(false);
  });

  it('should return false for string', () => {
    expect(isApiError('error string')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isApiError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isApiError(undefined)).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('should return message from API error response', () => {
    const error = new AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 400,
        statusText: 'Bad Request',
        data: { error: 'Validation failed', message: 'Name is required' },
        headers: {},
        config: { headers: new AxiosHeaders() },
      }
    );

    expect(getErrorMessage(error)).toBe('Name is required');
  });

  it('should return error field if no message', () => {
    const error = new AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 400,
        statusText: 'Bad Request',
        data: { error: 'Validation failed' },
        headers: {},
        config: { headers: new AxiosHeaders() },
      }
    );

    expect(getErrorMessage(error)).toBe('Validation failed');
  });

  it('should return default message for empty response', () => {
    const error = new AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 400,
        statusText: 'Bad Request',
        data: {},
        headers: {},
        config: { headers: new AxiosHeaders() },
      }
    );

    expect(getErrorMessage(error)).toBe('An error occurred');
  });

  it('should return message from regular Error', () => {
    const error = new Error('Something went wrong');
    expect(getErrorMessage(error)).toBe('Something went wrong');
  });

  it('should return default message for unknown error type', () => {
    expect(getErrorMessage('string error')).toBe('An unknown error occurred');
    expect(getErrorMessage(123)).toBe('An unknown error occurred');
    expect(getErrorMessage(null)).toBe('An unknown error occurred');
    expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
  });
});
