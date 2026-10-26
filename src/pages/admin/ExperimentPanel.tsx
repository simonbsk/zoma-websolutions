import { FlaskConical } from 'lucide-react';
import { EmptyState } from '../../components/ui/misc';
import { HEADLINES, HEADLINE_EXPERIMENT, HEADLINE_VARIANTS } from '../../content/site';
import { getExperimentSummary } from '../../lib/api/marketing';
import { useAsync } from '../../lib/useAsync';

const percent = (part: number, whole: number) => (whole ? `${((part / whole) * 100).toFixed(1)}%` : '—');

/** Results of the hero headline A/B test, per variant. */
export function ExperimentPanel() {
  const { data, error, loading } = useAsync(() => getExperimentSummary(HEADLINE_EXPERIMENT), []);

  const rows = HEADLINE_VARIANTS.map((variant) => {
    const r = data?.find((d) => d.variant === variant);
    const conversions = (r?.requests ?? 0) + (r?.bookings ?? 0);
    return { variant, views: r?.views ?? 0, clicks: r?.cta_clicks ?? 0, conversions };
  });
  const totalViews = rows.reduce((sum, r) => sum + r.views, 0);
  // Lead by conversion rate once there are requests or bookings, otherwise by click rate.
  const score = (r: (typeof rows)[number]) =>
    r.views ? (rows.some((x) => x.conversions) ? r.conversions / r.views : r.clicks / r.views) : 0;
  const leader = totalViews ? rows.reduce((best, r) => (score(r) > score(best) ? r : best)).variant : null;
  const pending = loading && !data;

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Headline experiment</h2>
          <p>Three hero headlines, assigned at random per visitor. Conversions are project requests plus bookings. Last 90 days.</p>
        </div>
      </div>

      {error ? (
        <EmptyState icon={<FlaskConical size={20} />} title="No results yet">
          Results appear here once the marketing migrations (0002 and 0003) are applied and visitors arrive.
        </EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Headline</th>
                <th>Views</th>
                <th>Start clicks</th>
                <th className="hide-md">Click rate</th>
                <th>Conversions</th>
                <th className="hide-md">Conversion rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.variant}>
                  <td>
                    <div className="cell-primary">
                      “{HEADLINES[r.variant].lead} {HEADLINES[r.variant].accent}.”
                      {leader === r.variant ? <span className="badge badge-active experiment-lead">Leading</span> : null}
                    </div>
                    <div className="cell-secondary">
                      Preview:{' '}
                      <a href={`/?${HEADLINE_EXPERIMENT}=${r.variant}`} target="_blank" rel="noreferrer">
                        /?{HEADLINE_EXPERIMENT}={r.variant}
                      </a>
                    </div>
                  </td>
                  <td>{pending ? '…' : r.views}</td>
                  <td>{pending ? '…' : r.clicks}</td>
                  <td className="hide-md">{percent(r.clicks, r.views)}</td>
                  <td>{pending ? '…' : r.conversions}</td>
                  <td className="hide-md">{percent(r.conversions, r.views)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="experiment-note">Wait for around 1,000 views per headline before calling a winner.</p>
        </div>
      )}
    </section>
  );
}
