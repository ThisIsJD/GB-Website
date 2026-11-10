import { analysisSamples } from './analysisSamples';

interface AnalysisOptionsProps {
  work: string;
  large: boolean;
  exercise: boolean;
  onWork: (work: string) => void;
  onLarge: (value: boolean) => void;
  onExercise: (value: boolean) => void;
}

export function AnalysisOptions({
  work,
  large,
  exercise,
  onWork,
  onLarge,
  onExercise,
}: AnalysisOptionsProps) {
  return (
    <fieldset className="analysis-options">
      <legend>Reading options</legend>
      <label>
        Choose a work
        <select value={work} onChange={(event) => onWork(event.target.value)}>
          {analysisSamples.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={large}
          onChange={(event) => onLarge(event.target.checked)}
        />{' '}
        Larger handwriting
      </label>
      <label>
        <input
          type="checkbox"
          checked={exercise}
          onChange={(event) => onExercise(event.target.checked)}
        />{' '}
        Include a long reading exercise
      </label>
    </fieldset>
  );
}
