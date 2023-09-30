import { AdaptivityProvider, ConfigProvider, SimpleCell, useAppearance } from '@vkontakte/vkui'
import { useLocation } from 'react-router-dom'
import queryString from 'query-string'

function Diff() {
  const appearance = useAppearance()
  const query = queryString.parse(useLocation().search)
  const commitHash1 = query.a
  const commitHash2 = query.b

  const commitHashesProvided = !!(commitHash1 && commitHash2)

  return (
    <ConfigProvider
      platform="vkcom"
      appearance={appearance}
      isWebView={false}
    >
      <AdaptivityProvider>
        {!commitHashesProvided
          && <>
            <SimpleCell>Please provide commit hashes in query like so:</SimpleCell>
            <SimpleCell>http://localhost:5173/?a=commitHash1&b=commitHash2</SimpleCell>
          </>
        }

        {commitHashesProvided
          && <>
            <SimpleCell>Comparing {commitHash1} and {commitHash2}</SimpleCell>
          </>
        }
      </AdaptivityProvider>
    </ConfigProvider>
  )
}

export default Diff
