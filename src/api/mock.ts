import type { Commit, DiffApi, DiffId, DiffInfo, DiffLine, GetDiffLinesParams } from './api'
import mockData from './mock_data/data'

export class MockDiff implements DiffApi {
  getBranches(): Promise<string[]> {
    throw new Error('Method not implemented.')
  }

  getCommits(): Promise<Commit[]> {
    throw new Error('Method not implemented.')
  }

  async getDiffInfo({ hashA, hashB }: DiffId): Promise<DiffInfo> {
    const key = `${hashA}...${hashB}`
    const data = mockData[key]
    // Simulate finding
    await sleepRandomIn(200, 600)
    if (!data)
      throw new Error('no mock data for specified commits')
    // Simulate parsing
    await sleepRandomIn(500, 1000)
    return {
      lines: data.totalLines,
      files: data.files,
    }
  }

  async getDiffLines({
    lineFrom,
    lineTo,
    diffId: { hashA, hashB },
  }: GetDiffLinesParams): Promise<DiffLine[]> {
    const key = `${hashA}...${hashB}`
    const data = mockData[key]

    // Simulate finding
    await sleepRandomIn(200, 600)

    if (!data)
      throw new Error('no mock data for specified commits')

    // Simulate parsing
    await sleepRandomIn(500, 1000)

    return data.lines.slice(lineFrom - 1, lineTo)
  }
}

async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

async function sleepRandomIn(rangeStart: number, rangeEnd: number) {
  const time = Math.random() * (rangeEnd - rangeStart) + rangeStart
  await sleep(time)
}
