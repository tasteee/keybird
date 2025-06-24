import { Text } from '@radix-ui/themes'
import { Flex } from './layout/Flex'
import cn from './SideBar.module.css'
import { datass } from 'datass'

const $sideBar = datass.object({
  isOpen: true,
})

export const SideBar = () => {
  return (
    <Flex.Row className={cn.root}>
      <Flex.Column>
        <Flex.Row className={cn.logoBox}>
          <img src="/logo.png" alt="Logo" />
        </Flex.Row>
        <Flex.Column className={cn.navList}>
          <Flex.Row className={cn.navSection}>
            <Text className={cn.navSectionTitle}>Progressions</Text>
            <Text className={cn.navSectionItem}>Discover</Text>
            <Text className={cn.navSectionItem}>Yours</Text>
          </Flex.Row>
          <Flex.Row className={cn.navSection}>
            <Text className={cn.navSectionTitle}>Patterns</Text>
            <Text className={cn.navSectionItem}>Discover</Text>
            <Text className={cn.navSectionItem}>Yours</Text>
          </Flex.Row>
        </Flex.Column>
      </Flex.Column>
    </Flex.Row>>
  )
}
