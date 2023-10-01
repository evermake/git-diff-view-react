import type { DiffApi, DiffId, DiffInfo, DiffLine, GetDiffLinesParams } from './api'
import mockData from './mock_data/data'

export class MockDiff implements DiffApi {
  async getDiffInfo({ hashA, hashB }: DiffId): Promise<DiffInfo> {
    const key = `2d0d06f...25a3173`
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
    const key = `2d0d06f...25a3173`
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
