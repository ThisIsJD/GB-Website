/** Only files actually present in this checkout belong in the usable asset list. */
export const mediaAssets = [
  {
    id: 'jd-portrait',
    kind: 'portrait',
    status: 'supplied',
    src: '/images/profile/jd.jpg',
    width: 400,
    height: 400,
    alt: 'John Daniel P. Labing',
    caption: 'John Daniel P. Labing',
    credit: 'Photograph supplied by JD.',
    sourceFile: 'assets/picnijd.jpg',
    sourceUrl: null,
    license: null,
    permission: 'Supplied by JD for use in this portfolio.',
  },
] as const;

/** The Phase 2 owner supplies this notice when the branches are integrated. */
export const fontCredit = {
  family: 'Patrick Hand',
  creator: 'Patrick Wagesreiter',
  copyright: 'Copyright (c) 2010-2012 Patrick Wagesreiter',
  license: 'SIL Open Font License 1.1',
  package: '@fontsource/patrick-hand',
  status: 'verified-in-p2-awaiting-integration',
  noticeFileFromP2: 'public/licenses/Patrick-Hand-OFL.txt',
} as const;

export const pendingMediaCredits = [
  {
    id: 'optional-illustrations-and-doodles',
    status: 'none-selected',
    note: 'No work illustration, archival image, generated image, or Oreo Doodle asset has been selected or copied in Phase 1. Record actual files, creators, source links, and permissions when selected.',
  },
] as const;

export const marginNoteCredit =
  'The margin notes are original portfolio wording, not quotations from the literary works.';
