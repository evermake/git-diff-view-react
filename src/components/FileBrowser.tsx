import { Cell, Group, Text } from '@vkontakte/vkui'
import type { FileDiffInfo } from '../api/api'

interface P {
  files: FileDiffInfo[]
}

function FileBrowser(props: P) {
  return (
      <Group mode="card" style={{ top: 10 }}>
        {props.files.map(f =>
          <Cell key={f.path}>
            <Text>{f.path}</Text>
          </Cell>,
        )}
      </Group>
  )
}

export default FileBrowser
