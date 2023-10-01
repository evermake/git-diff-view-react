import { useEffect, useState } from 'react'
import { Button, Select } from '@vkontakte/vkui'
import type { Commit } from '../api/api'
import { Api } from '../api/api'

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
    <div style={{ margin: 10 }}>
    Commit 1 {commit1 ? `#${commit1}` : ''}
    <Select options={branches} onChange={
      (e: any) => {
        if (e && e.target && e.target.value)
          api.getCommits(e.target.value).then(commits => setCommits1(commits.map((c: Commit) => ({ value: c.sha1, label: c.message }))))
      }
    }/>
    {commits1.length > 0
    && <Select options={commits1} onChange={(e: any) => setCommit1(e.target.value.substring(0, 7))}/>
    }

      Commit 2 {commit2 ? `#${commit2}` : ''}
      <Select options={branches} onChange={
        (e: any) => {
          if (e && e.target && e.target.value)
            api.getCommits(e.target.value).then(commits => setCommits2(commits.map((c: Commit) => ({ value: c.sha1, label: c.message }))))
        }
      }/>
      {commits2.length > 0
        && <Select options={commits2} onChange={(e: any) => setCommit2(e.target.value.substring(0, 7))}/>
      }

    {commit1 && commit2
    && <Button style={{ width: '100%', marginTop: 20 }} onClick={() => window.location.assign(`/diff/?a=${commit1}&b=${commit2}`)}>
        <div>
          Git diff!
        </div>
      </Button>
    }
  </div>
  )
}

export default Selector
