import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// This repo does not enable vitest's `globals: true` (explicit imports only), so
// @testing-library/react's automatic afterEach(cleanup) registration never fires —
// it depends on detecting a global `afterEach`. Register it explicitly instead.
afterEach(cleanup);
