// @env: mixed
import React from 'react';

type LayoutProps = {
  slots: Record<string, React.ReactNode>;
  main: React.ReactNode;
  routeMeta?: Record<string, unknown>;
};

export default function LayoutEmpty({ slots, main }: LayoutProps) {
  return (
    <>
      {slots.content}
      {main}
      {slots['global-overlay']}
    </>
  );
}
