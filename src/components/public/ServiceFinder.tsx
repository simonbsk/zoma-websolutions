import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { FINDER_QUESTIONS } from '../../content/site';
import { FINDER_REASONS, pickService, recommendVisual, type FinderAnswers } from '../../lib/finder';
import { track } from '../../lib/experiments';
import type { Service } from '../../lib/types';

interface ServiceFinderProps {
  services: Service[];
  /** Reports the recommended service so the list can highlight it. */
  onRecommend: (serviceId: string | null) => void;
}

/** Three quick questions → the session that fits, pre-selected in the booking flow. */
export function ServiceFinder({ services, onRecommend }: ServiceFinderProps) {
  const [answers, setAnswers] = useState<Partial<FinderAnswers>>({});
  const step = FINDER_QUESTIONS.findIndex((q) => !(q.id in answers));
  const complete = step === -1;
  const visual = complete ? recommendVisual(answers as FinderAnswers) : null;
  const service = visual ? pickService(services, visual) : undefined;

  useEffect(() => {
    onRecommend(service?.id ?? null);
  }, [service?.id, onRecommend]);

  const answered = complete ? FINDER_QUESTIONS.length : step;
  const question = complete ? null : FINDER_QUESTIONS[step];

  function back() {
    const last = FINDER_QUESTIONS[answered - 1];
    if (!last) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[last.id];
      return next;
    });
  }

  return (
    <div className="finder" aria-live="polite">
      <div className="finder-head">
        <span>Not sure which fits?</span>
        <span className="finder-progress" aria-label={`Question ${Math.min(answered + 1, 3)} of 3`}>
          {FINDER_QUESTIONS.map((q, i) => (
            <i key={q.id} className={i < answered ? 'is-done' : i === answered ? 'is-current' : ''} />
          ))}
        </span>
      </div>

      {question ? (
        <div className="finder-step" key={question.id}>
          <p className="finder-question">{question.question}</p>
          <div className="finder-options">
            {question.options.map((option) => (
              <button
                key={option.value}
                type="button"
                className="finder-option"
                onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.value }) as Partial<FinderAnswers>)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {answered > 0 ? (
            <button type="button" className="finder-link" onClick={back}>
              <ArrowLeft size={14} /> Back
            </button>
          ) : null}
        </div>
      ) : service && visual ? (
        <div className="finder-result" key="result">
          <span className="finder-result-label">We’d start with</span>
          <strong className="finder-result-name">{service.name}</strong>
          <p>{FINDER_REASONS[visual]}</p>
          <div className="finder-actions">
            <Link
              to={`/book?service=${encodeURIComponent(service.slug)}`}
              className="btn btn-midnight btn-sm"
              onClick={() => track('cta_click')}
            >
              Book this session <ArrowRight size={15} />
            </Link>
            <button type="button" className="finder-link" onClick={() => setAnswers({})}>
              <RotateCcw size={13} /> Start over
            </button>
          </div>
        </div>
      ) : (
        <p className="finder-question">Our services are being finalised — book a call and we’ll talk it through.</p>
      )}
    </div>
  );
}
