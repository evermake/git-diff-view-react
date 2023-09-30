import { Cell, Group, Separator, Text } from '@vkontakte/vkui'
import type { FileDiffInfo } from '../api/api'

interface P {
  files: FileDiffInfo[]
}

function FileBrowser(props: P) {
  return (
      <Group mode="card" style={{top: 10, height: "100%", overflowY: 'auto'}}>
        <Cell>
          <Text>
            {props.files.length} file(s) changed:
          </Text>
        </Cell>
        <Separator/>
        {props.files.map(f =>
          <Cell key={f.path}>
            <Text>{f.path}</Text>
          </Cell>
        )}
      </Group>
  )
}

export default FileBrowser
