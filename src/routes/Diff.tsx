import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Cell,
  IconButton,
  Separator,
  Text,
  Title,
} from '@vkontakte/vkui'
import queryString from 'query-string'
import FileDiffList from '../components/FileDiffList'
import { Api } from '../api/api'
import type { DiffInfo } from '../api/api'
import { useTheme } from '../hooks/useTheme'
import SunOutline from '../components/icons/IconSunOutline'
import MoonOutline from '../components/icons/IconMoonOutline'
import styles from './Diff.module.scss'

function Diff() {
  const fileDiffList = useRef<any>(null)
  const [diffInfo, setDiffInfo] = useState<DiffInfo | null>(null)
  const [api, _] = useState(() => new Api())
  const { theme, setTheme } = useTheme()

  const query = queryString.parse(useLocation().search)
  const hashA = query.a
  const hashB = query.b
  const commitHashesProvided = typeof hashA === 'string' && typeof hashB === 'string'

  useEffect(() => {
    if (commitHashesProvided)
      api.getDiffInfo({ hashA, hashB }).then(d => setDiffInfo(d))
  }, [])

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles['header-left']}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Title level='3'>git diff</Title>
          </Link>
        </div>
        <div className={styles['header-right']}>
          <div>
            <Title level='3'>{`${hashA}...${hashB}`}</Title>
          </div>
          <div>
            <IconButton
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label='Переключить тему приложения'
            >
              {theme === 'dark' ? <SunOutline /> : <MoonOutline />}
            </IconButton>
          </div>
        </div>
      </header>
      <aside className={styles.sidebar}>
        <Text
          style={{
            textAlign: 'center',
            padding: '8px 6px',
          }}
        >Файлов изменено: {diffInfo?.files.length}</Text>
        <Separator />
        {diffInfo?.files.map(f =>
          <Cell key={f.path} onClick={() => fileDiffList.current.jumpToFile(f.path)}>
            <Text>{f.path}</Text>
          </Cell>,
        )}
      </aside>
      <main className={styles.content}>
        {diffInfo && commitHashesProvided && (
          <FileDiffList
            ref={fileDiffList}
            diffId={{ hashA, hashB }}
            diffInfo={diffInfo}
            api={api}
          />
        )}
      </main>
    </div>
  )
}

export default Diff
