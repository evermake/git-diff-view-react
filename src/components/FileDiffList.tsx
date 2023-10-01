import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { DiffApi, DiffId, DiffInfo } from '../api/api'
import useDynamicDiff from '../hooks/useDynamicDiff'
import FileDiff from './FileDiffs/FileDiff'
import DiffLoader from './DiffLoader'

interface P {
  diffId: DiffId
  diffInfo: DiffInfo
  api: DiffApi
}

let bottomBefore = -1
let topBefore = -1

const FileDiffList = forwardRef(({ diffId, diffInfo, api }: P, ref) => {
  const topRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const beforeUpdate = (shouldUseBottomAnchor?: true) => {
    const bottomPosition = bottomRef.current?.getBoundingClientRect().top
    const topPosition = topRef.current?.getBoundingClientRect().top
    if (bottomPosition === undefined || topPosition === undefined)
      return

    if (shouldUseBottomAnchor) {
      bottomBefore = bottomPosition
      topBefore = -1
    }
    else {
      topBefore = topPosition
      bottomBefore = -1
    }
  }

  const { renderFiles, reachedTop, reachedBottom, continueBottom, continueTop, removeFromBottom, removeFromTop, jumpToFile } = useDynamicDiff(diffId, diffInfo, api, beforeUpdate)

  useImperativeHandle(ref, () => ({
    jumpToFile: (path: string) => {
      window.scrollTo(0, 0)
      jumpToFile(path)
    },
  }))

  useEffect(() => {
    const bottomPosition = bottomRef.current?.getBoundingClientRect().top
    const topPosition = topRef.current?.getBoundingClientRect().top
    if (bottomPosition === undefined || topPosition === undefined)
      return

    if (bottomBefore !== -1)
      window.scrollBy(0, bottomPosition - bottomBefore)
    if (topBefore !== -1)
      window.scrollBy(0, topPosition - topBefore)

    bottomBefore = -1
    topBefore = -1
  }, [renderFiles])

  useEffect(() => {
    continueBottom()

    addEventListener('scroll', () => {
      const bottomPosition = bottomRef.current?.getBoundingClientRect().top
      const topPosition = topRef.current?.getBoundingClientRect().top
      if (bottomPosition === undefined || topPosition === undefined)
        return

      if (bottomPosition < 3000 && !reachedBottom.current)
        continueBottom()

      if (topPosition > -2000 && !reachedTop.current)
        continueTop()

      if (bottomPosition > 10000)
        removeFromBottom()

      if (topPosition < -11000)
        removeFromTop()
    })
  }, [])

  return (
    <>
      <DiffLoader hidden={reachedTop.current || renderFiles.length === 0}/>
      <div ref={topRef} style={{ height: 1 }}/>
      {renderFiles.map(renderFile => (
        <div key={`${renderFile.path}-${renderFile.content.length}`}>
          <FileDiff diffs={renderFile.content} path={renderFile.path}/>
        </div>
      ))}
      <div ref={bottomRef} style={{ height: 1 }}/>
      <DiffLoader hidden={reachedBottom.current || renderFiles.length === 0}/>
    </>
  )
})

export default FileDiffList
