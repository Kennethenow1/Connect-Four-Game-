import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node', // Tests don't need DOM for board logic
    },
});

