import { Link } from 'react-router'

export type Breadcrumb = { label: string; href?: string }

export function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
}: {
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
}) {
  return (
    <div>
      {breadcrumbs.length > 0 && (
        <nav aria-label="Caminho de navegação" className="mb-2 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.href ?? crumb.label}-${index}`} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden="true">/</span>}
                {crumb.href ? <Link to={crumb.href} className="hover:underline">{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <h1 className="dashboard-header-title">{title}</h1>
      {subtitle && <p className="dashboard-header-subtitle">{subtitle}</p>}
    </div>
  )
}
