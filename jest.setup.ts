import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
