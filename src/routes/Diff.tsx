import {
  Panel,
  PanelHeader,
  PanelHeaderButton,
  SimpleCell,
  SplitCol,
  SplitLayout,
  Title,
  View,
} from '@vkontakte/vkui'
import { Icon28ListOutline, Icon28MoonOutline, Icon28SunOutline } from '@vkontakte/icons'
import { useLocation } from 'react-router-dom'
import queryString from 'query-string'
import { useEffect, useState } from 'react'
import ExpandableFileBrowser from '../components/ExpandableFileBrowser'
import FileDiffList from '../components/FileDiffList'
import type { DiffInfo } from '../api/api'
import { MockDiff } from '../api/mock'
import { useTheme } from '../hooks/useTheme'

function Diff() {
  const [showFileBrowser, setShowFileBrowser] = useState(true)
  const [diffInfo, setDiffInfo] = useState<DiffInfo | null>(null)
  const [api, _] = useState(() => new MockDiff())

  const query = queryString.parse(useLocation().search)
  const hashA = query.a
  const hashB = query.b
  const commitHashesProvided = typeof hashA === 'string' && typeof hashB === 'string'

  useEffect(() => {
    if (commitHashesProvided)
      api.getDiffInfo({ hashA, hashB }).then(d => setDiffInfo(d))
  }, [])

  return (
    <>
      {commitHashesProvided
      && <>
          <SplitLayout>
            <ExpandableFileBrowser
              show={showFileBrowser}
              files={diffInfo ? diffInfo.files : []}
            />
            <SplitCol>
              <Header
                commitHashFrom={hashA}
                commitHashTo={hashB}
                onMenuButtonClick={() => setShowFileBrowser(!showFileBrowser)}
              />
              <View activePanel='panel'>
                <Panel id='panel'>

                  {diffInfo

                  && <div style={{ paddingRight: 10 }} >
                      <FileDiffList diffId={{ hashA, hashB }} diffInfo={diffInfo} api={api}/>
                    </div>
                  }
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
    </>
  )
}

interface HeaderProps {
  commitHashFrom: string
  commitHashTo: string
  onMenuButtonClick?: () => void
}

function Header({
  commitHashFrom,
  commitHashTo,
  onMenuButtonClick,
}: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <PanelHeader
      before={(
        <PanelHeaderButton
          onClick={onMenuButtonClick}
          aria-label='Скрыть/показать проводник файлов'
        >
          <Icon28ListOutline/>
        </PanelHeaderButton>
      )}
      visor={true}
      after={(
        <PanelHeaderButton
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label='Переключить тему приложения'
        >
          {theme === 'dark' ? <Icon28SunOutline/> : <Icon28MoonOutline/>}
        </PanelHeaderButton>
      )}
      fixed
    >
      <Title level='1'>{ `${commitHashFrom}..${commitHashTo}` }</Title>
    </PanelHeader>
  )
}

export default Diff
