import { Cell, Group, Separator, Text } from '@vkontakte/vkui'
import type { FileDiffInfo } from '../api/api'
import FileIcon from './FileIcon'

interface P {
  onFileClick: (path: string) => any
  files: FileDiffInfo[]
}

function FileBrowser(props: P) {
  return (
    <Group mode="card" style={{ top: 10, height: '100%', overflowY: 'auto' }}>
      <Cell>
        <Text>
          {props.files.length} file(s) changed:
        </Text>
      </Cell>
      <Separator />
      {props.files.map(f =>
        <Cell onClick={() => props.onFileClick(f.path)} key={f.path}>
          <div>
            <FileIcon path={f.path} />
            <Text>{f.path}</Text>
          </div>
        </Cell>,
      )}
    </Group>
  )
}

export default FileBrowser
