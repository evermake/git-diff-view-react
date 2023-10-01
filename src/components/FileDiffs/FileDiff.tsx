import { type ReactNode, memo, useState } from 'react'
import clsx from 'clsx'
import { Card, IconButton, Placeholder, Title, useAppearance } from '@vkontakte/vkui'
import { Icon16ArrowsUpDown, Icon56DocumentOutline } from '@vkontakte/icons'
import type { DiffLine } from '../../api/api'
import { assertNotReached } from '../../utils/assertNotReached'
import IconChevron from '../icons/IconChevron'
import styles from './FileDiff.module.scss'
import LineDiff from './LineDiff'
import FileIcon from '../FileIcon'

export interface FileDiffProps {
  path: string
  diffs: DiffLine[]
  isBinary?: boolean
}

function FileDiff({
  path,
  diffs,
  isBinary,
}: FileDiffProps): ReactNode {
  const appearance = useAppearance()
  const [collapsed, setCollapsed] = useState(false)

  // Insert "expand" rows
  const rows: (DiffLine | 'expand')[] = []
  let lastOldLineNo: number | null = null
  let lastNewLineNo: number | null = null
  for (const diff of diffs) {
    let oldLineNo: number | null = null
    let newLineNo: number | null = null
    switch (diff.type) {
      case 'not-modified':
      case 'modified':
        oldLineNo = Number(diff.oldLineNo)
        newLineNo = Number(diff.newLineNo)
        break
      case 'added':
        newLineNo = Number(diff.lineNo)
        break
      case 'deleted':
        oldLineNo = Number(diff.lineNo)
        break
      default:
        assertNotReached(diff)
    }

    // If there is a gap between line numbers, insert an "expand" row
    // (i.e. some lines were skipped)
    if (
      (lastOldLineNo !== null && oldLineNo !== null && lastOldLineNo + 1 !== oldLineNo)
      || (lastNewLineNo !== null && newLineNo !== null && lastNewLineNo + 1 !== newLineNo)
    )
      rows.push('expand')

    lastOldLineNo = oldLineNo ?? lastOldLineNo
    lastNewLineNo = newLineNo ?? lastNewLineNo

    rows.push(diff)
  }

  return (
    <Card
      className={clsx([
        styles.root,
        {
          [styles.dark]: appearance === 'dark',
        },
      ])}
      mode='outline'
    >
      <FileHeader
        path={path}
        collapsed={collapsed}
        onCollapseClick={() => setCollapsed(prev => !prev)}
      />
      {isBinary
        ? (
        <Placeholder
          icon={<Icon56DocumentOutline />}
          className={clsx({
            [styles.hidden]: collapsed,
          })}
        >
          Бинарные файлы скрыты из отоборажения
        </Placeholder>
          )
        : (
        <table
          className={clsx(
            styles['content-table'],
            {
              [styles.hidden]: collapsed,
            },
          )}
        >
          <tbody>
            {rows.map((row, i) => (row === 'expand'
              ? <tr className={styles['expand-row']}><td colSpan={4}><span><Icon16ArrowsUpDown/></span></td></tr>
              : <LineDiff key={i} diff={row} />
            ))}
          </tbody>
        </table>
          )
      }
    </Card>
  )
}

interface FileHeaderProps {
  path: string
  collapsed?: boolean
  onCollapseClick?: () => void
}

function FileHeader(props: FileHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles['header-left']}>
        <IconButton
          onClick={props.onCollapseClick}
          aria-label='Скрыть/показать содержимое файла'
        >
          <div
            className={clsx({
              [styles['rotate-90']]: !props.collapsed,
            })}
          >
            <IconChevron/>
          </div>
        </IconButton>
        <FileIcon path={props.path} />
        <Title level="3">{props.path}</Title>
      </div>
    </div>
  )
}

export default memo(
  FileDiff,
  (prev, next) => (prev.path === next.path && !!prev.isBinary === !!next.isBinary && prev.diffs.length === next.diffs.length),
)
