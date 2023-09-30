import { useEffect, useRef } from 'react'
import type { DiffApi, DiffId, DiffInfo } from '../api/api'
import useDynamicDiff from '../hooks/useDynamicDiff'
import FileDiff from './FileDiffs/FileDiff'

interface P {
  diffId: DiffId
  diffInfo: DiffInfo
  api: DiffApi
}

let bottomBefore = -1

function FileDiffList({ diffId, diffInfo, api }: P) {
  const topRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const beforeUpdate = (shouldUseBottomAnchor?: true) => {
    if (shouldUseBottomAnchor) {
      const bottomPosition = bottomRef.current?.getBoundingClientRect().top
      if (bottomPosition === undefined)
        return

      bottomBefore = bottomPosition
    }
    else {
      bottomBefore = -1
    }
  }

  const { renderFiles, reachedTop, reachedBottom, continueBottom, continueTop, jumpToFile } = useDynamicDiff(diffId, diffInfo, api, beforeUpdate)

  useEffect(() => {
    const bottomPosition = bottomRef.current?.getBoundingClientRect().top
    if (bottomPosition === undefined)
      return

    if (bottomBefore !== -1)
      window.scrollBy(0, bottomPosition - bottomBefore)
  }, [renderFiles])

  useEffect(() => {
    continueBottom()
    // jumpToFile('bunsen/bunsen-core-r4/src/main/java/com/cerner/bunsen/definitions/r4/package-info.java')

    addEventListener('scroll', () => {
      const bottomPosition = bottomRef.current?.getBoundingClientRect().top
      const topPosition = topRef.current?.getBoundingClientRect().top
      if (bottomPosition === undefined || topPosition === undefined)
        return

      if (bottomPosition < 3000 && !reachedBottom.current)
        continueBottom()

      if (topPosition > -2000 && !reachedTop.current)
        continueTop()
    })
  }, [])

  return (
    <>
      <div ref={topRef} style={{ height: 1 }}/>
      {renderFiles.map(renderFile => (
        <div key={`${renderFile.path}-${renderFile.content.length}`}>
          <FileDiff diffs={renderFile.content} path={renderFile.path}/>
        </div>
      ))}
      <div ref={bottomRef} style={{ height: 1 }}/>
    </>
  )
}

export default FileDiffList
