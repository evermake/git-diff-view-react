import { useEffect } from 'react'
import type { DiffApi, DiffId, DiffInfo } from '../api/api'
import useDynamicDiff from '../hooks/useDynamicDiff'
import FileDiff from './FileDiffs/FileDiff'

interface P {
  diffId: DiffId
  diffInfo: DiffInfo
  api: DiffApi
}

function FileDiffList({ diffId, diffInfo, api }: P) {
  const { renderFiles, reachedTop, reachedBottom, continueBottom, continueTop, jumpToFile, expand } = useDynamicDiff(diffId, diffInfo, api)

  useEffect(() => {
    continueBottom()
  }, [])

  return (
    <>
      {renderFiles.map(renderFile => (
        <div key={`${renderFile.path}-${renderFile.content.length}`}>
          {renderFile.path}
          <FileDiff diffs={renderFile.content}/>
        </div>
      ))}
    </>
  )
}

export default FileDiffList
