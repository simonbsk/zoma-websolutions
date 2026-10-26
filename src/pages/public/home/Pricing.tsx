import { Check } from 'lucide-react';
import { buttonClass } from '../../../components/ui/Button';
import { StartLink } from '../../../components/public/StartLink';
import { NotePin } from '../../../components/notes/DesignNotes';
import { CARE_PLAN, PRICING_TIERS } from '../../../content/site';

const TIER_ACCENT = { start: 'verdant', business: 'saffron', signature: 'iris' } as const;

export function Pricing() {
  return (
    <section className="section" id="pricing" aria-labelledby="pricing-title">
      <div className="container">
        <header className="section-head section-head-center">
          <p className="kicker dot-verdant">Pricing</p>
          <h2 id="pricing-title" className="title">
            Honest prices. <span className="title-quiet">No surprises.</span>
          </h2>
          <p className="lede">
            Every project starts with a free conversation and ends with a fixed-price offer. Three design directions, a
            site that works on every screen and support at launch are always included.
          </p>
        </header>

        <div className="tiers note-host">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={`tier accent-${TIER_ACCENT[tier.id]} ${tier.featured ? 'tier-featured' : 'tile'}`}
              data-reveal
              aria-labelledby={`tier-${tier.id}`}
            >
              {tier.featured ? <span className="tier-flag mono">Our recommendation</span> : null}
              <h3 id={`tier-${tier.id}`}>{tier.name}</h3>
              <p className="tier-for">{tier.audience}</p>
              <p className="tier-price">
                <span className="tier-from">from</span>
                <strong>€{tier.from}</strong>
              </p>
              <p className="tier-time mono">{tier.timeline}</p>
              <ul className="tier-list">
                {tier.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} strokeWidth={2.4} aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <StartLink
                from={`pricing-${tier.id}`}
                budget={tier.budget}
                service={tier.service}
                className={tier.featured ? 'btn btn-lg btn-block btn-inverse' : buttonClass('ghost', 'lg', 'btn-block')}
              />
            </article>
          ))}
          <NotePin id="vat" n={6} tag="Legal" title="Net or gross prices?" style={{ bottom: -46, right: 0 }}>
            <p>
              The prices are shown <strong>without VAT</strong>, which is fine for business clients. If private customers
              can buy too, German price law (PAngV) expects <strong>gross prices</strong> — or a clear “B2B only” line.
            </p>
            <p>Also replace the placeholder prices with your real offers before launch.</p>
          </NotePin>
        </div>
        <p className="tiers-note">One-time project prices, excl. 19% VAT. Hosting and care are optional and billed monthly.</p>

        <div className="care">
          <div className="care-intro">
            <p className="kicker dot-saffron">Subscription</p>
            <h3 className="care-title">After launch: {CARE_PLAN.name}</h3>
            <p>{CARE_PLAN.intro}</p>
            <p className="care-optional mono">Optional for every package</p>
          </div>
          <div className="tile care-card" data-reveal>
            <div className="care-price">
              <p>
                <strong>€{CARE_PLAN.price}</strong>
                <span>/ month</span>
              </p>
              <span className="care-terms mono">{CARE_PLAN.terms}</span>
            </div>
            <ul className="care-list">
              {CARE_PLAN.features.map((feature) => (
                <li key={feature}>
                  <Check size={16} strokeWidth={2.4} aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
