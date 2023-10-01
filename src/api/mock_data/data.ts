import type { DiffLine, FileDiffInfo } from '../api'
import Data_2d0d06f_25a3173 from './2d0d06f_25a3173.json'

export interface MockData {
  totalLines: number
  files: FileDiffInfo[]
  lines: DiffLine[]
}

const data = {
  '2d0d06f...25a3173': Data_2d0d06f_25a3173 as any,
} as Record<string, MockData | undefined>

export default data
