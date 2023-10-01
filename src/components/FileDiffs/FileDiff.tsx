import { type ReactNode, useState } from 'react'
import clsx from 'clsx'
import { Card, IconButton, Placeholder, Title, useAppearance } from '@vkontakte/vkui'
import { Icon56DocumentOutline } from '@vkontakte/icons'
import type { DiffLine } from '../../api/api'
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
              {diffs.map((diff, i) => <LineDiff key={i} diff={diff} />)}
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
            <IconChevron />
          </div>
        </IconButton>
        <FileIcon size={20} path={props.path} />
        <Title level="3">{props.path}</Title>
      </div>
    </div>
  )
}

export default FileDiff
