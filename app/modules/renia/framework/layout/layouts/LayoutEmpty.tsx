// @env: mixed
import React from 'react';

type LayoutProps = {
  regions: Record<string, React.ReactNode>;
  main: React.ReactNode;
  routeMeta?: Record<string, unknown>;
};

export default function LayoutEmpty({ regions, main }: LayoutProps) {
  return (
    <>
      {regions['content']}
      {main}
      {regions['global-overlay']}
    </>
  );
}
