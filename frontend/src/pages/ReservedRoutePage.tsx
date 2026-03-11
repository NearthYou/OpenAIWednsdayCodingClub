interface ReservedRoutePageProps {
  eyebrow: string;
  title: string;
  description: string;
  routeLabel: string;
}

export function ReservedRoutePage({
  eyebrow,
  title,
  description,
  routeLabel
}: ReservedRoutePageProps) {
  return (
    <main className="page-shell placeholder-page">
      <section className="panel placeholder-page__card">
        <p className="section-eyebrow">{eyebrow}</p>
        <h1 className="hero-title">{title}</h1>
        <p className="hero-description">{description}</p>
        <div className="placeholder-page__route-tag">라우트: {routeLabel}</div>
      </section>
    </main>
  );
}
