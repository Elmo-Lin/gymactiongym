import { Bolt } from './Logo'

export default function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="page-header">
      <div className="container page-header__inner">
        <p className="eyebrow eyebrow--light">
          <Bolt className="eyebrow__bolt" />
          {eyebrow}
        </p>
        <h1>{title}</h1>
        {children && <p className="page-header__lead">{children}</p>}
      </div>
    </header>
  )
}
