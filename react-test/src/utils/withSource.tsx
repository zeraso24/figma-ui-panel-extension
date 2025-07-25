import React from "react";

type SourceInfo = { file: string; line: number };

export function withSource<T extends object>(
  Component: React.ComponentType<T>,
  info: SourceInfo
) {
  return (props: T) => (
    <Component {...props} data-src={`${info.file}:${info.line}`} />
  );
} 