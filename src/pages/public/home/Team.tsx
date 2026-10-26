import type { ReactNode } from 'react';
import { NotePin } from '../../../components/notes/DesignNotes';
import { TEAM, type Silhouette as SilhouetteKind } from '../../../content/site';

/* Head-and-shoulders silhouettes; only the hair outline changes between people. */

const HAIR: Record<SilhouetteKind, ReactNode> = {
  quiff: (
    <>
      <path d="M68 80C64 50 80 36 102 36c20 0 34 12 32 40-4-14-14-20-32-20-16 0-28 8-34 24Z" />
      <path d="M90 42c6-18 30-22 40-8-10-3-24-1-40 8Z" />
    </>
  ),
  crop: <path d="M69 80c-3-28 12-40 31-40s34 12 31 40c-3-14-13-22-31-22s-28 8-31 22Z" />,
  curls: (
    <>
      <circle cx="74" cy="64" r="12" />
      <circle cx="86" cy="49" r="13" />
      <circle cx="102" cy="43" r="14" />
      <circle cx="118" cy="49" r="13" />
      <circle cx="128" cy="64" r="12" />
      <circle cx="70" cy="79" r="8" />
      <circle cx="131" cy="79" r="8" />
    </>
  ),
  beard: (
    <>
      <path d="M69 78c-3-26 12-38 31-38s34 12 31 38c-4-12-14-19-31-19s-27 7-31 19Z" />
      <path d="M70 92c2 30 18 44 30 44s28-14 30-44c-6 14-16 20-30 20s-24-6-30-20Z" />
    </>
  ),
};

function Silhouette({ kind }: { kind: SilhouetteKind }) {
  return (
    <svg className="silhouette" viewBox="0 0 200 200" aria-hidden>
      <g fill="currentColor">
        <path d="M26 200c2-40 32-60 74-60s72 20 74 60Z" />
        <path d="M86 112h28l2 30c-10 7-22 7-32 0Z" />
        <ellipse cx="69" cy="88" rx="6" ry="10" />
        <ellipse cx="131" cy="88" rx="6" ry="10" />
        <ellipse cx="100" cy="86" rx="31" ry="37" />
        {HAIR[kind]}
      </g>
    </svg>
  );
}

export function Team() {
  return (
    <section className="section" id="team" aria-labelledby="team-title">
      <div className="container">
        <header className="section-head section-head-split">
          <div>
            <p className="kicker dot-verdant">Team</p>
            <h2 id="team-title" className="title">
              Four people. <span className="title-quiet">One studio.</span>
            </h2>
          </div>
          <p className="lede">
            No account managers, no outsourcing. You talk directly to the people who design, build and look after your
            website.
          </p>
        </header>

        <div className="note-host">
          <ul className="team">
            {TEAM.map((member, i) => (
              <li
                key={member.name}
                className={`tile namecard accent-${member.accent}`}
                data-reveal
              >
                <span className="namecard-strap" aria-hidden />
                <span className="namecard-slot" aria-hidden />
                <div className="namecard-portrait">
                  <Silhouette kind={member.silhouette} />
                </div>
                <div className="namecard-text">
                  <span className="namecard-hello mono">Hello, I’m</span>
                  <strong className="namecard-name">{member.name}</strong>
                  <span className="namecard-role">{member.role}</span>
                </div>
                <span className="namecard-no mono" aria-hidden>
                  No. {String(i + 1).padStart(2, '0')}
                </span>
              </li>
            ))}
          </ul>
          <NotePin id="portraits" n={8} tag="Trust" title="Real faces and real roles" style={{ top: -14, right: -10 }}>
            <p>
              The silhouettes keep the name-card idea; real photos in the same crop (shoulders up, plain background,
              matching light) would build far more trust. The roles are placeholders — confirm them with each of you.
            </p>
          </NotePin>
        </div>
      </div>
    </section>
  );
}
