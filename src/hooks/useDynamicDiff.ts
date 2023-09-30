import { useState } from 'react'
import type { DiffApi, DiffId, DiffInfo, DiffLine } from '../api/api'

interface CachedLine {
  index: number
  content: DiffLine
}

class DiffStorage {
  private storage: CachedLine[] = []

  public rangeExists(start: number, end: number): boolean {
    const startIndex = this.findStorageIndex(start)
    if (startIndex === null)
      return false
    if (this.storage.length < startIndex + (end - start + 1))
      return false

    for (let i = startIndex; i < startIndex + (end - start + 1); i++) {
      if (this.storage[i].index !== start + (i - startIndex))
        return false
    }

    return true
  }

  public getParentRange(start: number, end: number): CachedLine[] {
    const startIndex = this.findStorageIndex(start)

    if (startIndex === null || !this.rangeExists(start, end))
      throw new Error('This range of lines is not in the cache')

    let parentRangeStartIndex = startIndex
    for (let i = startIndex; i >= 0; i--) {
      if (this.storage[i].index === start - (startIndex - i))
        parentRangeStartIndex = i
      else
        break
    }

    let parentRangeEndIndex = startIndex + (end - start + 1)
    for (let i = startIndex + (end - start + 1); i < this.storage.length; i++) {
      if (this.storage[i].index === end + (i - (startIndex + (end - start + 1))))
        parentRangeEndIndex = i
      else
        break
    }

    const res: CachedLine[] = []
    for (let i = parentRangeStartIndex; i <= parentRangeEndIndex; i++)
      res.push(this.storage[i])

    return res
  }

  public addRange(start: number, lines: DiffLine[]): void {
    if (this.storage.length === 0 || this.storage[this.storage.length - 1].index < start) {
      for (let i = 0; i < lines.length; i++)
        this.storage.push({ index: start + i, content: lines[i] })
      return
    }

    const items: CachedLine[] = []
    for (let i = 0; i < lines.length; i++)
      items.push({ index: start + i, content: lines[i] })

    if (this.storage[0].index > start + lines.length - 1) {
      this.storage.splice(0, 0, ...items)
      return
    }

    let spliceStart = -1
    let spliceDeleteCount = 0
    for (let i = 0; i < this.storage.length; i++) {
      if (this.storage[i].index >= start && spliceStart === -1)
        spliceStart = i

      if (this.storage[i].index >= start && this.storage[i].index <= start + lines.length - 1)
        spliceDeleteCount++
    }

    this.storage.splice(spliceStart, spliceDeleteCount, ...items)
  }

  private findStorageIndex(index: number): number | null {
    for (let i = 0; i < this.storage.length; i++) {
      if (this.storage[i].index === index)
        return i
    }
    return null
  }
}

interface RenderFile {
  path: string
  content: DiffLine[]
  isBinary: boolean
}

const LINES_IN_PAGE = 500

const diff = new DiffStorage()
function useDynamicDiff(diffId: DiffId, meta: DiffInfo, api: DiffApi) {
  const [reachedTop, setReachedTop] = useState(false)
  const [reachedBottom, setReachedBottom] = useState(false)
  const [renderFiles, setRenderFiles] = useState<RenderFile[]>([])

  const [renderRegionStart, setRenderRegionStart] = useState(0)
  const [renderRegionEnd, setRenderRegionEnd] = useState(0)

  const requestContent = async (start: number, end: number) => {
    const fixedStart = Math.max(1, start)
    const fixedEnd = Math.min(meta.lines, end)

    if (diff.rangeExists(start, end))
      return diff.getParentRange(start, end)

    const lines = await api.getDiffLines({ diffId, lineFrom: fixedStart, lineTo: fixedEnd })
    diff.addRange(start, lines)

    return diff.getParentRange(start, end)
  }

  const updateRenderFiles = (lines: CachedLine[]) => {
    setRenderRegionStart(lines[0].index)
    setRenderRegionEnd(lines[lines.length - 1].index)

    setReachedTop(renderRegionStart === 1)
    setReachedBottom(renderRegionEnd === meta.lines)

    let firstRenderedFileIndex = 0
    if (!reachedTop) {
      for (let i = 0; i < meta.files.length; i++) {
        const file = meta.files[i]
        if (!file.isBinary && file.diffEndLine >= renderRegionStart) {
          firstRenderedFileIndex = i
          break
        }
      }
    }

    let lastRenderedFileIndex = meta.files.length - 1
    if (!reachedBottom) {
      for (let i = 0; i < meta.files.length; i++) {
        const file = meta.files[i]
        if (!file.isBinary && file.diffStartLine >= renderRegionEnd) {
          lastRenderedFileIndex = i - 1
          break
        }
      }
    }

    const res: RenderFile[] = []
    let nextLineIndex = 0
    for (let i = firstRenderedFileIndex; i <= lastRenderedFileIndex; i++) {
      const file = meta.files[i]
      res.push({
        path: file.path,
        isBinary: file.isBinary,
        content: [],
      })

      if (!file.isBinary) {
        while (nextLineIndex < lines.length) {
          if (lines[nextLineIndex].index <= file.diffEndLine) {
            res[res.length - 1].content.push(lines[nextLineIndex].content)
            nextLineIndex++
          }
        }
      }
    }

    setRenderFiles(res)
  }

  const continueBottom = () => {
    requestContent(renderRegionEnd, renderRegionEnd + LINES_IN_PAGE)
      .then(content => updateRenderFiles(content))
  }

  const continueTop = () => {
    requestContent(renderRegionStart - LINES_IN_PAGE, renderRegionStart)
      .then(content => updateRenderFiles(content))
  }

  const jumpToFile = (path: string) => {
    const fileMetaIndex = meta.files.findIndex(f => f.path === path)
    if (fileMetaIndex === -1)
      throw new Error(`No such file with path ${path}`)
    const fileMeta = meta.files[fileMetaIndex]

    let fileStartsAtLine = 1

    // eslint-disable-next-line max-statements-per-line
    if (!fileMeta.isBinary) { fileStartsAtLine = fileMeta.diffStartLine }
    else {
      for (let i = fileMetaIndex - 1; i >= 0; i--) {
        const fileMeta = meta.files[i]
        if (!fileMeta.isBinary) {
          fileStartsAtLine = fileMeta.diffEndLine
          break
        }
      }
    }

    requestContent(fileStartsAtLine - Math.floor(LINES_IN_PAGE / 2), fileStartsAtLine + Math.floor(LINES_IN_PAGE / 2))
      .then(content => updateRenderFiles(content))
  }

  return [{ renderFiles, reachedTop, reachedBottom }, { continueBottom, continueTop, jumpToFile }]
}

export default useDynamicDiff
