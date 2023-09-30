import type {
  PlatformType,
} from '@vkontakte/vkui'
import {
  AdaptivityProvider,
  ConfigProvider,
  Panel,
  PanelHeader,
  PanelHeaderButton,
  SimpleCell,
  SplitCol,
  SplitLayout,
  Title,
  View,
  useAppearance,
} from '@vkontakte/vkui'
import { Icon28ListOutline } from '@vkontakte/icons'
import { useLocation } from 'react-router-dom'
import queryString from 'query-string'
import { useState } from 'react'
import ExpandableFileBrowser from '../components/ExpandableFileBrowser'
import type { FileDiffInfo } from '../api/api'
import { MockDiff } from '../api/mock'

function Diff() {
  const [showFileBrowser, setShowFileBrowser] = useState(true)
  const [files, setFiles] = useState<FileDiffInfo[]>([])

  const appearance = useAppearance()
  const platform: PlatformType = 'vkcom'

  const query = queryString.parse(useLocation().search)
  const hashA = query.a
  const hashB = query.b
  const commitHashesProvided = typeof hashA === 'string' && typeof hashB === 'string'

  const api = new MockDiff()
  if (commitHashesProvided)
    api.getDiffInfo({ hashA, hashB }).then(d => setFiles(d.files))

  return (
    <ConfigProvider
      platform={platform}
      appearance={appearance}
      isWebView={false}
    >
      <AdaptivityProvider>
        {commitHashesProvided
          && <>
              <SplitLayout>
                <ExpandableFileBrowser show={showFileBrowser} files={files}/>
                <SplitCol>
                  <View activePanel='panel'>
                    <Panel id='panel'>
                      <PanelHeader before={<PanelHeaderButton onClick={() => setShowFileBrowser(!showFileBrowser)}> <Icon28ListOutline/> </PanelHeaderButton>} visor={true}>
                        <Title>Comparing {hashA} and {hashB}</Title>
                      </PanelHeader>
                      DATA
                    </Panel>
                  </View>
                </SplitCol>
              </SplitLayout>
          </>
        }

        {!commitHashesProvided
          && <>
            <SimpleCell>Please provide commit hashes in query like so:</SimpleCell>
            <SimpleCell>http://localhost:5173/?a=2d0d06f&b=25a3173</SimpleCell>
          </>
        }
      </AdaptivityProvider>
    </ConfigProvider>
  )
}

export default Diff
