import { createTRPCReact } from "@trpc/react-query";

// If you have a backend tRPC router, update this type to match it.
// For now we use `any` to avoid build errors.
export const trpc = createTRPCReact<any>();
