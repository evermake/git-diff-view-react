import React from 'react'
import type { ClassValue } from 'clsx'
import clsx from 'clsx'

import type { DiffLine } from '../../api/api'
import { assertNotReached } from '../../utils/assertNotReached'
import styles from './LineDiff.module.scss'

export interface LineDiffProps {
  diff: DiffLine
}

const LineDiff: React.FC<LineDiffProps> = React.memo(
  ({ diff }) => {
    let children
    if (diff.type === 'added') {
      children = (
        <>
          <Cell type="void-line-no" />
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
          <Cell type="void-line-no" />
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
  },
)

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
  } | {
    type: 'void-line-no'
  }
)

function Cell(props: CellProps) {
  let content = null
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
    classes = [styles['cell-void']]
  }
  else if (props.type === 'void-line-no') {
    classes = [styles['cell-void-line-no']]
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
    >{ content }</td>
  )
}

export default LineDiff
