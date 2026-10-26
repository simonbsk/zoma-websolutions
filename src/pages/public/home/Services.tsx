import { RefreshCw, ShoppingBag, Sparkles, Wrench, type LucideIcon } from 'lucide-react';
import { NotePin } from '../../../components/notes/DesignNotes';
import { SERVICES, type ServiceOption } from '../../../content/site';

const ICONS: Partial<Record<ServiceOption, LucideIcon>> = {
  'new-website': Sparkles,
  relaunch: RefreshCw,
  fixes: Wrench,
  shop: ShoppingBag,
};

const ACCENTS = ['iris', 'saffron', 'verdant', 'iris'];

export function Services() {
  return (
    <section className="section" id="services" aria-labelledby="services-title">
      <div className="container">
        <header className="section-head section-head-split">
          <div>
            <p className="kicker dot-saffron">Services</p>
            <h2 id="services-title" className="title">
              Wherever your website stands, <span className="title-quiet">we take it from there.</span>
            </h2>
          </div>
          <p className="lede">
            New, renewed, repaired or extended — every project gets the same care, a fixed price and a small team that
            knows it inside out.
          </p>
        </header>

        <div className="note-host">
          <ul className="services">
            {SERVICES.map((service, i) => {
              const Icon = ICONS[service.id] ?? Sparkles;
              return (
                <li
                  key={service.id}
                  className={`tile service accent-${ACCENTS[i]}`}
                  data-reveal
                >
                  <div className="service-top">
                    <span className="mono service-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="service-icon" aria-hidden>
                      <Icon size={20} strokeWidth={1.7} />
                    </span>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <div className="service-meta mono">
                    <span>{service.price}</span>
                    <span>{service.time}</span>
                  </div>
                </li>
              );
            })}
          </ul>
          <NotePin id="service-proof" n={3} tag="Trust" title="One real example per service" style={{ top: -14, right: -10 }}>
            <p>
              Each square could flip to show a project of that kind — a relaunch before/after, a shop, a fixed site with
              its speed score. Until real projects exist, the three concepts further down can stand in.
            </p>
          </NotePin>
        </div>
      </div>
    </section>
  );
}
