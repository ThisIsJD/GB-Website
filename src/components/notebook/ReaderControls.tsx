import { portfolio } from '../../lib/content/portfolio';

interface Props {
  disabled: boolean;
  reading: boolean;
  workId?: string;
  anchor: string;
  onDestination: (id: string) => void;
}
export function ReaderControls({
  disabled,
  reading,
  workId,
  anchor,
  onDestination,
}: Props) {
  const workIndex = portfolio.works.findIndex(({ id }) => id === workId);
  const answer = portfolio.documents
    .flatMap(({ answers }) => answers)
    .find((answer) => answer.anchor === anchor);
  return (
    <>
      <div className="reader-selects">
        <label>
          Go to a work
          <select
            disabled={disabled && !reading}
            value={workId ?? ''}
            onChange={(event) => onDestination(event.target.value)}
          >
            <option value="" disabled>
              Choose a work
            </option>
            {portfolio.works.map(({ id, title }) => (
              <option value={id} key={id}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Go to an answer
          <select
            disabled={disabled && !reading}
            value={answer?.anchor ?? ''}
            onChange={(event) => onDestination(event.target.value)}
          >
            <option value="" disabled>
              Choose an answer
            </option>
            {portfolio.works.map((work) => (
              <optgroup key={work.id} label={work.title}>
                {portfolio.documents
                  .find(({ id }) => id === work.id)!
                  .answers.map((answer, index) => (
                    <option key={answer.anchor} value={answer.anchor}>
                      {index + 1}. {answer.key}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>
      <nav
        className="reader-arrows reader-work-links"
        aria-label="Work navigation"
      >
        <button
          disabled={(disabled && !reading) || workIndex <= 0}
          onClick={() => onDestination(portfolio.works[workIndex - 1]!.id)}
        >
          Previous work
        </button>
        <button
          disabled={disabled && !reading}
          onClick={() => onDestination('literary-analyses')}
        >
          Return to analyses
        </button>
        <button
          disabled={
            (disabled && !reading) ||
            workIndex < 0 ||
            workIndex >= portfolio.works.length - 1
          }
          onClick={() => onDestination(portfolio.works[workIndex + 1]!.id)}
        >
          Next work
        </button>
      </nav>
    </>
  );
}
