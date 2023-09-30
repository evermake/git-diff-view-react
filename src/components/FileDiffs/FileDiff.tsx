import { type ReactNode, useState } from 'react'
import clsx from 'clsx'
import { Card, IconButton, Title, useAppearance } from '@vkontakte/vkui'
import { Icon16Chevron } from '@vkontakte/icons'
import type { DiffLine } from '../../api/api'
import styles from './FileDiff.module.scss'
import LineDiff from './LineDiff'

export interface FileDiffProps {
  path: string
  diffs: DiffLine[]
}

function FileDiff({
  path,
  diffs,
}: FileDiffProps): ReactNode {
  const appearance = useAppearance()
  const [collapsed, setCollapsed] = useState(false)

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
        >
          <Icon16Chevron
            width={16}
            height={16}
            className={clsx({
              [styles['rotate-90']]: !props.collapsed,
            })}
          />
        </IconButton>
        <Title level="3">{ props.path }</Title>
      </div>
    </div>
  )
}

export default FileDiff
