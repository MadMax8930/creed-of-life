import type { LibraryPassage } from '@/lib/content/library-types';
import { toParagraphs } from '@/lib/content/localize';
import SaveButton from './SaveButton';

interface PassageProps {
  passage: LibraryPassage;
  /** Shown before the heading, e.g. "2.1". */
  index: string;
  locale: string;
  headingLevel: 2 | 3 | 4;
  labels: { save: string; fallbackNotice: string };
  /** Extra controls rendered next to the bookmark (e.g. "Remove"). */
  children?: React.ReactNode;
}

/**
 * One written passage: its original heading and full original text, exactly as
 * stored. Used by the home explorer, the principle pages and Saved Reflections.
 */
export default function Passage({ passage, index, locale, headingLevel, labels, children }: PassageProps) {
  const Heading = `h${headingLevel}` as const;
  const titleId = `p-${passage.id}-title`;
  return (
    <article id={`p-${passage.id}`} className="passage" aria-labelledby={titleId}>
      <header className="passage__head">
        <div>
          <span className="passage__index" aria-hidden="true">
            {index}
          </span>
          <Heading
            id={titleId}
            className="passage__title"
            lang={passage.titleLang !== locale ? passage.titleLang : undefined}
          >
            {passage.title}
          </Heading>
        </div>
        <div className="passage__tools">
          {children}
          <SaveButton id={passage.id} label={labels.save} />
        </div>
      </header>
      {passage.textLang !== locale && <p className="note passage__notice">{labels.fallbackNotice}</p>}
      <div className="passage__text" lang={passage.textLang !== locale ? passage.textLang : undefined}>
        {toParagraphs(passage.text).map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
