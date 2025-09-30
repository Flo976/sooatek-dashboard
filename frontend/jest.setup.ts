import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder in Jest environment
import { TextEncoder, TextDecoder } from 'util';

// @ts-ignore
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

// Mock fetch if not available
import { fetch, Request, Response } from 'whatwg-fetch';
global.fetch = fetch;
global.Request = Request;
global.Response = Response;
