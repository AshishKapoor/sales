import { defineConfig } from "orval";

export default defineConfig({
  sales: {
    input: "./schema/sales-cookbook-api.yaml",
    output: {
      target: "./client/gen/sales/index.ts",
      schemas: "./client/gen/sales",
      client: "swr",
      mode: "tags-split",
      mock: false,
      prettier: true,
      override: {
        mutator: {
          path: "./client/http-sales-client.ts",
          name: "httpSalesClient",
        },
      },
    },
  },
});
