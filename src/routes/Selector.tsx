import { useEffect, useState } from 'react'
import { Button, Card, Select, Text, Title } from '@vkontakte/vkui'
import type { Commit } from '../api/api'
import { Api } from '../api/api'
import styles from './Selector.module.scss'

function Selector() {
  const [api, _] = useState(() => new Api())
  const [branches, setBranches] = useState([])
  const [commits1, setCommits1] = useState([])
  const [commits2, setCommits2] = useState([])
  const [commit1, setCommit1] = useState<string | null>(null)
  const [commit2, setCommit2] = useState<string | null>(null)

  useEffect(() => {
    api.getBranches().then(branches => setBranches(branches.map((b: any) => ({ value: b, label: b }))))
  }, [])

  return (
    <main className={styles.root}>
      <Card mode='outline' className={styles.card}>
        <Title className={styles.heading}>Выберите коммиты для сравнения</Title>
        <div className={styles['selectors-container']}>
          <div className={styles['selector-container']}>
            <Text>Коммит 1 {commit1 ? `#${commit1}` : ''}</Text>
            <Select
              options={branches}
              onChange={(e: any) => {
                if (e && e.target && e.target.value)
                  api.getCommits(e.target.value).then(commits => setCommits1(commits.map((c: Commit) => ({ value: c.sha1, label: `#${c.sha1.substring(0, 7)} - ${c.message}` }))))
              }}
            />
            {commits1.length > 0
              && <Select options={commits1} onChange={(e: any) => setCommit1(e.target.value.substring(0, 7))}/>
            }
          </div>
          <div className={styles['selector-container']}>
            <Text>Коммит 2 {commit2 ? `#${commit2}` : ''}</Text>
            <Select options={branches} onChange={
              (e: any) => {
                if (e && e.target && e.target.value)
                  api.getCommits(e.target.value).then(commits => setCommits2(commits.map((c: Commit) => ({ value: c.sha1, label: `#${c.sha1.substring(0, 7)} - ${c.message}` }))))
              }
            }/>
            {commits2.length > 0
              && <Select options={commits2} onChange={(e: any) => setCommit2(e.target.value.substring(0, 7))}/>
            }
          </div>
        </div>
        {commit1 && commit2 && (
          <Button
            className={styles.button}
            onClick={() => window.location.assign(`/diff/?a=${commit1}&b=${commit2}`)
          }>
              Открыть diff
          </Button>
        )}
      </Card>
    </main>
  )
}

export default Selector
