import { AdaptivityProvider, Button, ConfigProvider, useAppearance } from '@vkontakte/vkui'

function App() {
  const appearance = useAppearance()

  return (
    <ConfigProvider
      platform="vkcom"
      appearance={appearance}
      isWebView={false}
    >
      <AdaptivityProvider>
        <Button>Hello</Button>
      </AdaptivityProvider>
    </ConfigProvider>
  )
}

export default App
