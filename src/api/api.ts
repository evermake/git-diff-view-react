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
