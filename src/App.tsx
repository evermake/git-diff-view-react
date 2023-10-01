import { Route, Routes } from 'react-router-dom'
import { AdaptivityProvider, AppRoot, ConfigProvider } from '@vkontakte/vkui'
import { useLocalStorage } from '@uidotdev/usehooks'
import Diff from './routes/Diff'
import { ThemeContext } from './hooks/useTheme'

function App() {
  const [theme_, setTheme] = useLocalStorage('theme', 'dark')
  const theme = theme_ === 'dark' ? 'dark' : 'light'

  return (
    <ConfigProvider
      platform="ios"
      appearance={theme}
      isWebView={false}
    >
      <AdaptivityProvider>
        <AppRoot>
          <ThemeContext.Provider value={{ theme, setTheme }}>
            <Routes>
              <Route path="/" element={<Diff />} />
              <Route path="*" element={<>No such route on frontend</>} />
            </Routes>
          </ThemeContext.Provider>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  )
}

export default App
