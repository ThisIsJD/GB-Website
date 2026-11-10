import type { ComponentProps } from 'react';
import { Button } from 'sketchbook-ui';

type ButtonProps = ComponentProps<typeof Button>;

export function SketchButton({ className = '', ...props }: ButtonProps) {
  return (
    <Button
      type="button"
      colors={{
        bg: 'var(--color-paper)',
        stroke: 'var(--color-cover)',
        text: 'var(--color-cover)',
      }}
      typography={{
        fontFamily: 'var(--font-handwriting)',
        fontSize: 'var(--text-control)',
        fontWeight: 400,
        textTransform: 'none',
      }}
      {...props}
      className={`notebook-button ${className}`}
    />
  );
}
