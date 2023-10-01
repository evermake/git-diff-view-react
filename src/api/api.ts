export interface DiffApi {
  getDiffInfo(diffId: DiffId): Promise<DiffInfo>
  getDiffLines(params: GetDiffLinesParams): Promise<DiffLine[]>
}

/**
 * Diff identifier.
 */
export interface DiffId {
  hashA: string
  hashB: string
}

export interface GetDiffLinesParams {
  diffId: DiffId
  lineFrom: number
  lineTo: number
}

export type DiffLine =
{
  type: 'not-modified'
  oldLineNo: number
  newLineNo: number
  content: string
} | {
  type: 'modified'
  oldLineNo: number
  oldContent: string
  newLineNo: number
  newContent: string
} | {
  type: 'added'
  lineNo: number
  content: string
} | {
  type: 'deleted'
  lineNo: number
  content: string
}

export interface DiffInfo {
  /**
   * Total number of lines in the diff.
   */
  lines: number

  /**
   * Information about files diffs.
   */
  files: FileDiffInfo[]
}

export type FileDiffInfo = {
  /**
   * Path to the file in the repository.
   *
   * Example: `src/api/client.ts`
   */
  path: string

  /**
   * Whether this file is binary file (i.e. no diff info is available).
   */
  isBinary: boolean
} & (
  | {
    isBinary: false

    /**
     * Number of line in the diff, where diff for this file begins.
     * (inclusive)
     */
    diffStart: number

    /**
     * Number of line in the diff, where diff for this file ends.
     * (inclusive)
     */
    diffEnd: number
  } | {
    isBinary: true
  }
)

export class Api implements DiffApi {
  async getDiffInfo({ hashA, hashB }: DiffId): Promise<DiffInfo> {
    const res = await fetch(`http://localhost:7777/repo/diff/map?a=${hashA}&b=${hashB}`)
    const data = await res.json()
    return {
      lines: data.linesTotal,
      files: data.files.map((f: Record<string, any>) => ({
        path: f.dst.path,
        isBinary: f.isBinary,
        diffStart: f.lines.start,
        diffEnd: f.lines.end,
      })),
    }
  }

  async getDiffLines({
    lineFrom, lineTo, diffId: { hashA, hashB },
  }: GetDiffLinesParams): Promise<DiffLine[]> {
    const res = await fetch(`http://localhost:7777/repo/diff/part?a=${hashA}&b=${hashB}&start=${lineFrom}&end=${lineTo}`)
    const data = await res.json()

    const typeMap = { 'M': 'modified', 'D': 'deleted', 'A': 'added', '': 'not-modified' }
    return data.map((line: Record<string, any>) => ({
      type: typeMap[line.operation as ('M' | 'D' | 'A' | '')],
      ...(line.operation === 'M' && {
        oldContent: line.src.content.substring(0, line.src.content.length - 1),
        newContent: line.dst.content.substring(0, line.dst.content.length - 1),
        oldLineNo: line.src.number,
        newLineNo: line.dst.number,
      }),
      ...(line.operation === 'A' && {
        content: line.dst.content.substring(0, line.dst.content.length - 1),
        lineNo: line.dst.number,
      }),
      ...(line.operation === 'D' && {
        content: line.src.content.substring(0, line.src.content.length - 1),
        lineNo: line.src.number,
      }),
      ...(line.operation === '' && {
        content: line.src.content.substring(0, line.src.content.length - 1),
        oldLineNo: line.src.number,
        newLineNo: line.dst.number,
      }),
    }))
  }
}
