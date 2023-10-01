import { Card, Spinner } from '@vkontakte/vkui'
import clsx from 'clsx'
import styles from './DiffLoader.module.scss'

export interface DiffLoaderProps {
  hidden?: boolean
}

function DiffLoader({ hidden }: DiffLoaderProps) {
  return (
    <Card
      mode='outline'
      className={clsx([
        styles.root,
        { [styles.hidden]: hidden },
      ])}
    >
      <Spinner>Загрузка...</Spinner>
    </Card>
  )
}

export default DiffLoader
