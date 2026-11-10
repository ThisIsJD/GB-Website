import { portfolio } from '../lib/content/portfolio';
import { parseMarkdown } from '../lib/content/parseMarkdown';

const url = `https://example.org/${'long-source-address'.repeat(32)}`;
const exercise = `## A layout exercise

This extra writing tests the page layout. It is separate from the original analysis.

${'A careful reader keeps each idea in order, even when the writing continues on another page. 🧭 '.repeat(30)}

3. A short list item stays together.
4. ${'An oversized item must keep its words and number as it continues. '.repeat(30)}
5. A final item with a nested list:
   - Keep the first thought.
   - Keep the **second thought** and [its source](https://example.org/source).

> ${'A quotation can continue without losing its meaning or emphasis. '.repeat(22)}
>
> This is the final paragraph of the quotation.

[${url}](${url})

![John Daniel P. Labing](/images/profile/jd.jpg)

Photograph supplied by JD. This image also tests asset readiness.
`;

export function paginationSample(id: string, stress: boolean) {
  const document = portfolio.documents.find((document) => document.id === id)!;
  const work = portfolio.works.find((work) => work.id === id)!;
  return {
    title: document.title,
    blocks: [
      ...document.blocks,
      ...work.sourceNote,
      ...work.sourceIds.flatMap(
        (id) => portfolio.sources.find((source) => source.id === id)!.blocks,
      ),
      ...(stress
        ? parseMarkdown(exercise, { documentId: 'layout-exercise' })
        : []),
    ],
  };
}
