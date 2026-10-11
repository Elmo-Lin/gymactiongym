import { useState } from 'react'
import { relativeDate } from '../utils.js'
import { Icon, Remaining } from './ui.jsx'

const FILTERS = [
  { id: 'all', label: '全部', test: () => true },
  { id: 'renew', label: '快到期', test: (s) => s.remaining > 0 && s.remaining <= 3 },
  { id: 'empty', label: '已用完', test: (s) => s.remaining === 0 },
]

export default function Students({ students, onOpen, onCreate }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const active = FILTERS.find((f) => f.id === filter)
  const list = students.filter(
    (s) => active.test(s) && (s.name.includes(query.trim()) || s.goal.includes(query.trim())),
  )

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="dateline num">
            {students.length}
            <span>位</span>
          </p>
          <h1>學生</h1>
        </div>
        <button className="btn btn-ink" onClick={onCreate}>
          + 新增學生
        </button>
      </header>

      <div className="toolbar">
        <div className="tabs">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={filter === f.id ? 'active' : ''}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              <span className="num">{students.filter(f.test).length}</span>
            </button>
          ))}
        </div>
        <label className="search">
          <Icon name="search" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋姓名或目標"
          />
        </label>
      </div>

      {list.length === 0 ? (
        <p className="empty">找不到符合條件的學生</p>
      ) : (
        <div className="block roster-wrap">
          <table className="roster">
            <thead>
              <tr>
                <th>學生</th>
                <th className="hide-sm">目標</th>
                <th className="hide-sm">已上課</th>
                <th className="hide-sm">上次上課</th>
                <th className="right">堂數</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => {
                const last = s.history[s.history.length - 1]
                const used = s.total - s.remaining
                return (
                  <tr key={s.id} onClick={() => onOpen(s.id)}>
                    <td>
                      {/* 點擊會冒泡到整列的 onClick，這裡只負責鍵盤操作 */}
                      <button className="roster-name">
                        {s.name}
                      </button>
                      <span className="roster-sub">
                        {s.gender} · {s.age} 歲<span className="show-sm"> · {s.goal}</span>
                      </span>
                    </td>
                    <td className="hide-sm">{s.goal}</td>
                    <td className="hide-sm">
                      <div className="ticks" style={{ '--n': s.total }} aria-label={`已上 ${used} / ${s.total} 堂`}>
                        {Array.from({ length: s.total }, (_, i) => (
                          <i key={i} className={i < used ? 'on' : ''} />
                        ))}
                      </div>
                    </td>
                    <td className="hide-sm muted">{last ? relativeDate(last.date) : '尚未上課'}</td>
                    <td className="right">
                      <Remaining remaining={s.remaining} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
