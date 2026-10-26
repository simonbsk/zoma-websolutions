import { HEADLINES, HEADLINE_EXPERIMENT, HEADLINE_VARIANTS } from '../../content/site';
import { useVariant } from '../../lib/experiments';
import { useReveal } from '../../lib/useReveal';
import { Hero } from './home/Hero';
import { Services } from './home/Services';
import { Choices } from './home/Choices';
import { Showcase } from './home/Showcase';
import { Pricing } from './home/Pricing';
import { Faq } from './home/Faq';
import { Team } from './home/Team';
import { Closing } from './home/Closing';
import './home/home.css';

/*
 * The homepage. The ink background (PublicLayout → InkBackground) tells its own story behind
 * these sections: drops fall into the hero, wake up and dance through "How it works", and
 * become the three concept websites in "Work".
 */
export function HomePage() {
  const variant = useVariant(HEADLINE_EXPERIMENT, HEADLINE_VARIANTS);
  useReveal();

  return (
    <>
      <Hero headline={HEADLINES[variant]} />
      <Services />
      <Choices />
      <Showcase />
      <Pricing />
      <Faq />
      <Team />
      <Closing />
    </>
  );
}
