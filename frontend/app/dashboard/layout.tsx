'use client'

import {
  Box,
  Flex,
  Icon,
  IconButton,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerContent,
  useColorMode,
  Button,
} from '@chakra-ui/react'
import { FiMenu, FiX, FiHome, FiCalendar, FiUsers, FiDollarSign, FiSettings, FiMoon, FiSun } from 'react-icons/fi'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface NavItemProps {
  icon: any
  children: React.ReactNode
  href: string
}

const NavItem = ({ icon, children, href }: NavItemProps) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'brand.500' : 'transparent'}
        color={isActive ? 'white' : 'inherit'}
        _hover={{
          bg: isActive ? 'brand.600' : 'gray.100',
          color: isActive ? 'white' : 'gray.900',
        }}
      >
        <Icon
          mr="4"
          fontSize="16"
          as={icon}
        />
        {children}
      </Flex>
    </Link>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user, logout } = useAuth()
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>

      {/* Header */}
      <Box
        ml={{ base: 0, md: 60 }}
        p="4"
        bg={useColorModeValue('white', 'gray.800')}
        borderBottom="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Flex alignItems="center" justifyContent="space-between">
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            variant="outline"
            aria-label="open menu"
            icon={<FiMenu />}
          />
          <Text fontSize="2xl" fontWeight="bold">
            {user?.nome}
          </Text>
          <Stack direction="row" spacing={4}>
            <Button onClick={toggleColorMode}>
              {colorMode === 'light' ? <FiMoon /> : <FiSun />}
            </Button>
            <Button onClick={() => logout()}>Sair</Button>
          </Stack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  )
}

const SidebarContent = ({ onClose, ...rest }: { onClose: () => void }) => {
  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          Salão Estética
        </Text>
      </Flex>
      <Stack spacing={1}>
        <NavItem icon={FiHome} href="/dashboard">
          Dashboard
        </NavItem>
        <NavItem icon={FiCalendar} href="/dashboard/agenda">
          Agenda
        </NavItem>
        <NavItem icon={FiUsers} href="/dashboard/clientes">
          Clientes
        </NavItem>
        <NavItem icon={FiDollarSign} href="/dashboard/financeiro">
          Financeiro
        </NavItem>
        <NavItem icon={FiSettings} href="/dashboard/configuracoes">
          Configurações
        </NavItem>
      </Stack>
    </Box>
  )
} 