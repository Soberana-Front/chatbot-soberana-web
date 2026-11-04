import { Link } from 'react-router'

export function ForbiddenPage() {
  return (
    <main className="not-found-page">
      <p className="not-found-code">Erro 403</p>
      <h1 className="not-found-title">Acesso negado</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <Link className="not-found-link" to="/dashboard">Voltar ao dashboard</Link>
    </main>
  )
}
