import { Card, Spinner } from '@vkontakte/vkui'

export interface DiffLoaderProps {
  hidden?: boolean
}

function DiffLoader({ hidden }: DiffLoaderProps) {
  return (
    <Card
      mode='outline'
      style={{
        display: hidden ? 'none' : 'block',
        padding: '12px 0',
        marginTop: 'var(--diff-spacing)',
      }}
    >
      <Spinner>Загрузка...</Spinner>
    </Card>
  )
}

export default DiffLoader
