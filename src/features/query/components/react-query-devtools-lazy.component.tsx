"use client";

import dynamic from "next/dynamic";

const ReactQueryDevtools = dynamic(
  () =>
    process.env.NODE_ENV === "development"
      ? import("@tanstack/react-query-devtools").then((m) => ({
          default: m.ReactQueryDevtools,
        }))
      : Promise.resolve({ default: () => null }),
  { ssr: false },
);

export const ReactQueryDevtoolsLazy = () => (
  <ReactQueryDevtools initialIsOpen={false} />
);
