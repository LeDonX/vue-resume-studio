import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [vue()],
    // Gitee Pages can be served under a sub-path, e.g. /repo-name/
    // Set VITE_BASE_PATH=/your-repo-name/ in .env.production to lock it.
    // Fallback './' keeps built asset paths relative and avoids 404 in subdirectories.
    base: env.VITE_BASE_PATH || "./"
  };
});
