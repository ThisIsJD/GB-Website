import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MarkdownContent } from '../../src/components/content/MarkdownContent';

describe('MarkdownContent', () => {
  it('preserves paragraphs and source links as selectable HTML text', () => {
    const html = renderToStaticMarkup(createElement(MarkdownContent, {
      children: 'First answer.\n\nSecond answer with [source](https://example.com).',
    }));
    expect(html).toContain('<p>First answer.</p>');
    expect(html).toContain('<p>Second answer with <a href="https://example.com">source</a>.</p>');
  });

  it('does not render embedded raw HTML', () => {
    const html = renderToStaticMarkup(createElement(MarkdownContent, {
      children: 'Before.\n\n<script>alert("raw HTML")</script>\n\nAfter.',
    }));
    expect(html).toContain('Before.');
    expect(html).toContain('After.');
    expect(html).not.toContain('<script>');
  });
});
