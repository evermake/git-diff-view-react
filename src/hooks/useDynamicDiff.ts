import { useRef, useState } from 'react'
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

    const parentRangeStartIndex = startIndex
    // for (let i = startIndex; i >= 0; i--) {
    //   if (this.storage[i].index === start - (startIndex - i))
    //     parentRangeStartIndex = i
    //   else
    //     break
    // }

    const parentRangeEndIndex = startIndex + (end - start)
    // for (let i = startIndex + (end - start); i < this.storage.length; i++) {
    //   if (this.storage[i].index === end + (i - (startIndex + (end - start))))
    //     parentRangeEndIndex = i
    //   else
    //     break
    // }

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

const LINES_IN_PAGE = 50

const diff = new DiffStorage()
let renderRegionStart = 0
let renderRegionEnd = 0
let isBusy = false
function useDynamicDiff(diffId: DiffId, meta: DiffInfo, api: DiffApi, beforeUpdate: (shouldUseBottomAnchor?: true) => any) {
  const reachedTop = useRef(false)
  const reachedBottom = useRef(false)
  const [renderFiles, setRenderFiles] = useState<RenderFile[]>([])

  const requestContent = async (start: number, end: number) => {
    const fixedStart = Math.max(1, start)
    const fixedEnd = Math.min(meta.lines, end)

    if (diff.rangeExists(fixedStart, fixedEnd))
      return diff.getParentRange(fixedStart, fixedEnd)

    isBusy = true
    const lines = await api.getDiffLines({ diffId, lineFrom: fixedStart, lineTo: fixedEnd })
    isBusy = false

    diff.addRange(fixedStart, lines)
    return diff.getParentRange(fixedStart, fixedEnd)
  }

  const updateRenderFiles = (lines: CachedLine[], shouldUseBottomAnchor?: true) => {
    renderRegionStart = lines[0].index
    renderRegionEnd = lines[lines.length - 1].index

    const isTopReached = lines[0].index === 1
    const isBottomReached = lines[lines.length - 1].index === meta.lines
    // setReachedTop(isTopReached)
    // setReachedBottom(isBottomReached)
    reachedTop.current = isTopReached
    reachedBottom.current = isBottomReached

    let firstRenderedFileIndex = 0
    if (!isTopReached) {
      for (let i = 0; i < meta.files.length; i++) {
        const file = meta.files[i]
        if (!file.isBinary && file.diffEnd >= lines[0].index) {
          firstRenderedFileIndex = i
          break
        }
      }
    }

    let lastRenderedFileIndex = meta.files.length - 1
    if (!isBottomReached) {
      for (let i = 0; i < meta.files.length; i++) {
        const file = meta.files[i]
        if (!file.isBinary && file.diffStart >= lines[lines.length - 1].index) {
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
          if (lines[nextLineIndex].index < renderRegionStart || lines[nextLineIndex].index > renderRegionEnd)
            continue

          if (lines[nextLineIndex].index <= file.diffEnd) {
            res[res.length - 1].content.push(lines[nextLineIndex].content)
            nextLineIndex++
          }
          else {
            break
          }
        }
      }
    }

    beforeUpdate(shouldUseBottomAnchor)
    setRenderFiles(res)
  }

  const continueBottom = () => {
    if (isBusy)
      return

    console.log('Adding to bottom')

    requestContent(renderRegionStart, renderRegionEnd + LINES_IN_PAGE)
      .then(content => updateRenderFiles(content))
  }

  const continueTop = () => {
    if (isBusy)
      return

    console.log('Adding to top')

    requestContent(renderRegionStart - LINES_IN_PAGE, renderRegionEnd)
      .then(content => updateRenderFiles(content, true))
  }

  const removeFromBottom = () => {
    if (isBusy)
      return

    console.log('Removing from bottom')

    requestContent(renderRegionStart, renderRegionEnd - LINES_IN_PAGE)
      .then(content => updateRenderFiles(content))
  }

  const removeFromTop = () => {
    if (isBusy)
      return

    console.log('Removing from top')

    requestContent(renderRegionStart + LINES_IN_PAGE, renderRegionEnd)
      .then(content => updateRenderFiles(content, true))
  }

  const jumpToFile = (path: string) => {
    if (isBusy)
      return

    const fileMetaIndex = meta.files.findIndex(f => f.path === path)
    if (fileMetaIndex === -1)
      throw new Error(`No such file with path ${path}`)
    const fileMeta = meta.files[fileMetaIndex]

    let fileStartsAtLine = 1

    // eslint-disable-next-line max-statements-per-line
    if (!fileMeta.isBinary) { fileStartsAtLine = fileMeta.diffStart }
    else {
      for (let i = fileMetaIndex - 1; i >= 0; i--) {
        const fileMeta = meta.files[i]
        if (!fileMeta.isBinary) {
          fileStartsAtLine = fileMeta.diffEnd
          break
        }
      }
    }

    requestContent(fileStartsAtLine - Math.floor(LINES_IN_PAGE / 2), fileStartsAtLine + Math.floor(LINES_IN_PAGE / 2))
      .then(content => updateRenderFiles(content))
  }

  return { renderFiles, reachedTop, reachedBottom, continueBottom, continueTop, removeFromBottom, removeFromTop, jumpToFile }
}

export default useDynamicDiff
