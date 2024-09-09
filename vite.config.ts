import { UserConfig, defineConfig } from 'vite';
import path from 'path';
import cleanupPlugin from 'rollup-plugin-cleanup';
import tsconfigPaths from 'vite-tsconfig-paths';
import fs from 'fs';
import Logger from '@aliser/logger';
const { logInfo, logError } = new Logger('vite-config');

export default defineConfig(({ mode }) => {
    logInfo('generating config for mode/build source path: ' + mode);

    /**
     * This is a base config that would be used for both regular build mode
     * and with the custom build script.
     */
    const baseConfig: UserConfig = {
        plugins: [
            tsconfigPaths(),
        ],
        build: {
            target: 'esnext',
            minify: false,
            emptyOutDir: false,
        }
    }

    return baseConfig
});