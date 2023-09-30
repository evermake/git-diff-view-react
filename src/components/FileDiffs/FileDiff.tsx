import { type ReactNode, useState } from 'react'
import clsx from 'clsx'
import { Button } from '@vkontakte/vkui'
import type { DiffLine } from '../../api/api'
import styles from './FileDiff.module.scss'
import LineDiff from './LineDiff'

export interface FileDiffProps {
  diffs: DiffLine[]
  showExpandButton?: boolean
  onExpandButtonClick?: () => void
}

function FileDiff({
  diffs,
  showExpandButton,
  onExpandButtonClick,
}: FileDiffProps): ReactNode {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Button onClick={() => setCollapsed(prev => !prev)}>
          { collapsed ? 'Expand' : 'Collapse' }
        </Button>
        {showExpandButton && (
          <Button onClick={onExpandButtonClick}>
            Expand all
          </Button>
        )}
      </div>
      <table
        className={clsx(
          styles['content-table'],
          {
            [styles['content-table-collapsed']]: collapsed,
          },
        )}
      >
        <tbody>
          {diffs.map(diff => <LineDiff diff={diff} />)}
        </tbody>
      </table>
    </div>
  )
}

export default FileDiff
