import { SplitCol } from '@vkontakte/vkui'
import type { FileDiffInfo } from '../api/api'
import FileBrowser from './FileBrowser'

interface P {
  show: boolean
  files: FileDiffInfo[]
}

function ExpandableFileBrowser(props: P) {
  return (
    <SplitCol fixed width={props.show ? 220 : 0} maxWidth={props.show ? 230 : 0}>
      <FileBrowser files={props.files}/>
    </SplitCol>
  )
}

export default ExpandableFileBrowser
