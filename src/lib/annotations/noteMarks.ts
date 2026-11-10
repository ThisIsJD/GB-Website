import { annotate } from 'rough-notation';
import tokens from '../../styles/tokens.json';

type Annotation = ReturnType<typeof annotate>;

/** Brand accents reused so the hand-drawn marks stay on palette. */
const palette = [
  tokens.color.annotation.underline,
  tokens.color.bookmark.analyses.accent,
  tokens.color.bookmark.favorite.accent,
  tokens.color.bookmark.learning.accent,
];
const characterTerms: Record<string, readonly string[]> = {
  'voice-out-of-the-whirlwind': ['Job'],
  panchatantra: ['Vishnu Sharma'],
  mahabharata: ['Arjuna', 'Krishna', 'Draupadi'],
  iliad: ['Achilles', 'Agamemnon', 'Patroclus', 'Priam', 'Hector'],
  odyssey: ['Odysseus', 'Cyclops', 'Athena', 'Penelope'],
  'tale-of-genji': ['Genji', 'Murasaki Shikibu', 'Aoi'],
  'les-miserables': [
    'Jean Valjean',
    'Javert',
    'Fantine',
    'Cosette',
    'Marius',
  ],
};
const profileAnnotationTerms: Record<
  string,
  'underline' | 'highlight' | 'circle'
> = {
  'John Daniel P. Labing': 'underline',
  JD: 'highlight',
  'BS Computer Science': 'underline',
  'Fourth Year': 'underline',
  'University of Nueva Caceres': 'underline',
  'Great Books-GEC-GB-NRs': 'circle',
  '1560': 'underline',
};
const profileTermPatterns: Record<string, string> = {
  'Fourth Year': 'Fourth[- ]Year',
};

/** Short key terms get an enclosing mark, longer ones underline to stay legible. */
function markType(
  el: HTMLElement,
  index: number,
): 'underline' | 'box' | 'circle' {
  const length = el.textContent?.trim().length ?? 0;
  if (length > 18) return 'underline';
  return index % 2 === 0 ? 'box' : 'circle';
}

/** Emphasised key terms, excluding the bold label inside a sticky note. */
function keyTerms(root: HTMLElement, limit: number): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>('.reading-content strong'),
  )
    .filter((el) => !el.closest('.note-sticky'))
    .slice(0, limit);
}

function characterMatches(
  root: HTMLElement,
): { element: HTMLElement; type: 'highlight' | 'underline' | 'circle' }[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = (node.parentElement as HTMLElement | null) ?? null;
      if (
        parent?.closest(
          [
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            '.note-sticky',
            '.leaf-header',
            '.leaf-opening',
            '.leaf-footer',
            '.leaf-portrait',
            '[aria-hidden="true"]',
          ].join(','),
        )
      )
        return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (
      node.parentElement?.closest('.rough-annotation, .character-highlight')
    )
      continue;
    nodes.push(node as Text);
  }
  const matches: {
    element: HTMLElement;
    type: 'highlight' | 'underline' | 'circle';
  }[] = [];
  nodes.forEach((textNode) => {
    const text = textNode.nodeValue ?? '';
    const context = textNode.parentElement?.closest<HTMLElement>(
      '[data-work-id], [data-document-id]',
    );
    const workId = context?.dataset.workId ?? context?.dataset.documentId;
    const terms = workId
      ? characterTerms[workId] ?? []
      : Object.keys(profileAnnotationTerms);
    if (!terms.length) return;
    const pattern = new RegExp(
      `\\b(${terms
        .slice()
        .sort((a, b) => b.length - a.length)
        .map(
          (term) =>
            profileTermPatterns[term] ??
            term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        )
        .join('|')})\\b`,
      'gi',
    );
    pattern.lastIndex = 0;
    if (!pattern.test(text)) return;
    pattern.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    text.replace(pattern, (match, _group, offset: number) => {
      fragment.append(text.slice(cursor, offset));
      const span = document.createElement('span');
      span.className = 'character-highlight';
      span.textContent = match;
      fragment.append(span);
      matches.push({
        element: span,
        type: workId
          ? 'highlight'
          : profileAnnotationTerms[
                match.replace('-', ' ').toLowerCase() === 'fourth year'
                  ? 'Fourth Year'
                  : match
              ] ?? 'highlight',
      });
      cursor = offset + match.length;
      return match;
    });
    fragment.append(text.slice(cursor));
    textNode.parentNode?.replaceChild(fragment, textNode);
  });
  return matches;
}

function draw(root: HTMLElement, animate: boolean, limit: number): Annotation[] {
  const marks = keyTerms(root, limit).map((el, index) => {
    const type = markType(el, index);
    return annotate(el, {
      type,
      color: palette[index % palette.length]!,
      animate,
      animationDuration: tokens.motion.annotationMs,
      strokeWidth: type === 'underline' ? 2 : 1.6,
      padding: type === 'underline' ? 1 : 3,
      multiline: type === 'underline',
      iterations: 1,
    });
  });
  characterMatches(root).forEach(({ element, type }) => {
    marks.push(
      annotate(element, {
        type,
        color:
          type === 'highlight'
            ? tokens.color.annotation.highlight
            : tokens.color.annotation.underline,
        animate,
        animationDuration: tokens.motion.annotationMs,
        strokeWidth: type === 'underline' ? 2 : 1.8,
        padding: type === 'underline' ? 1 : 3,
        multiline: type === 'underline',
        iterations: 1,
      }),
    );
  });
  marks.forEach((mark) => mark.show());
  return marks;
}

const marksByRoot = new WeakMap<HTMLElement, Annotation[]>();
const annotated = new WeakSet<HTMLElement>();

/**
 * Draw hand-drawn Rough Notation marks over a visible leaf's key terms, once
 * each time the leaf enters view, so every page turn re-animates them.
 */
export function decorateLeaf(leaf: HTMLElement, animate: boolean): void {
  if (annotated.has(leaf)) return;
  annotated.add(leaf);
  marksByRoot.set(leaf, draw(leaf, animate, 6));
}

/** Clear a leaf's marks as it leaves view so it re-animates when turned back to. */
export function undecorateLeaf(leaf: HTMLElement): void {
  if (!annotated.has(leaf)) return;
  annotated.delete(leaf);
  marksByRoot.get(leaf)?.forEach((mark) => mark.remove());
  marksByRoot.delete(leaf);
}

/** Annotate the whole continuous reading surface once (no page turns there). */
export function decorateReading(root: HTMLElement, animate: boolean): void {
  marksByRoot.get(root)?.forEach((mark) => mark.remove());
  annotated.add(root);
  marksByRoot.set(root, draw(root, animate, 120));
}
