import type { ReactNode } from 'react'
import type { ClassValue } from 'clsx'
import clsx from 'clsx'

import type { DiffLine } from '../../api/api'
import styles from './LineDiff.module.scss'

export interface LineDiffProps {
  diff: DiffLine
}

function LineDiff({ diff }: LineDiffProps): ReactNode {
  let children
  if (diff.type === 'added') {
    children = (
      <>
        <Cell type="void" lastRight />
        <Cell type="line-no" state="added" lineNo={diff.lineNo} />
        <Cell type="content" state="added" content={diff.content} />
      </>
    )
  }
  else if (diff.type === 'deleted') {
    children = (
      <>
        <Cell type="line-no" state="deleted" lineNo={diff.lineNo} />
        <Cell type="content" state="deleted" content={diff.content} lastRight />
        <Cell type="void" />
      </>
    )
  }
  else if (diff.type === 'modified') {
    children = (
      <>
        <Cell type="line-no" state="deleted" lineNo={diff.oldLineNo} />
        <Cell type="content" state="deleted" content={diff.oldContent} lastRight />
        <Cell type="line-no" state="added" lineNo={diff.newLineNo} />
        <Cell type="content" state="added" content={diff.newContent} />
      </>
    )
  }
  else if (diff.type === 'not-modified') {
    children = (
      <>
        <Cell type="line-no" state="not-modified" lineNo={diff.oldLineNo} />
        <Cell type="content" state="not-modified" content={diff.content} lastRight />
        <Cell type="line-no" state="not-modified" lineNo={diff.newLineNo} />
        <Cell type="content" state="not-modified" content={diff.content} />
      </>
    )
  }
  else {
    assertNotReached(diff)
  }

  return (
    <tr className={styles.row}>{children}</tr>
  )
}

type CellProps = {
  lastRight?: boolean
}
& (
  | {
    type: 'line-no'
    state: 'deleted' | 'added' | 'not-modified'
    lineNo: number
  } | {
    type: 'content'
    state: 'deleted' | 'added' | 'not-modified'
    content: string
  } | {
    type: 'void'
  }
)

function Cell(props: CellProps) {
  let content = null
  let colSpan = 1
  let classes: ClassValue[] = []
  if (props.type === 'line-no') {
    content = props.lineNo
    classes = [
      styles['cell-line-no'],
      {
        [styles['cell-deleted']]: props.state === 'deleted',
        [styles['cell-added']]: props.state === 'added',
        [styles['cell-not-modified']]: props.state === 'not-modified',
      },
    ]
  }
  else if (props.type === 'content') {
    content = props.content
    classes = [
      styles['cell-content'],
      {
        [styles['cell-deleted']]: props.state === 'deleted',
        [styles['cell-added']]: props.state === 'added',
        [styles['cell-not-modified']]: props.state === 'not-modified',
      },
    ]
  }
  else if (props.type === 'void') {
    colSpan = 2
    classes = [styles['cell-void']]
  }
  else {
    assertNotReached(props)
  }

  return (
    <td
      className={clsx([
        styles.cell,
        { [styles['cell-last-right']]: props.lastRight },
        ...classes,
      ])}
      colSpan={colSpan}
    >{ content }</td>
  )
}

function assertNotReached(_: never): never {
  throw new Error('should not be impossible')
}

export default LineDiff
