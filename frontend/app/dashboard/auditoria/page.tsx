'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  HStack,
  VStack,
  Text,
  Badge,
  Spinner,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton
} from '@chakra-ui/react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useAudit, AuditAction, AuditResource } from '@/services/audit'
import { ChevronDownIcon, DownloadIcon } from '@chakra-ui/icons'

interface AuditEntry {
  id: string
  timestamp: Date
  userId: string
  userName: string
  userRole: string
  action: AuditAction
  resource: AuditResource
  resourceId?: string
  details: string
  changes?: {
    before: any
    after: any
  }
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<AuditEntry | null>(null)
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    resource: '',
    startDate: '',
    endDate: ''
  })
  
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure()
  
  const toast = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const { getAuditLogs, exportAuditLogs } = useAudit()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    loadLogs()
  }, [user, router])

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/audit')
      if (!response.ok) throw new Error('Erro ao carregar logs')
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os logs de auditoria',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (filters.userId) queryParams.append('userId', filters.userId)
      if (filters.action) queryParams.append('action', filters.action)
      if (filters.resource) queryParams.append('resource', filters.resource)
      if (filters.startDate) queryParams.append('startDate', filters.startDate)
      if (filters.endDate) queryParams.append('endDate', filters.endDate)

      const response = await fetch(`/api/audit?${queryParams.toString()}`)
      if (!response.ok) throw new Error('Erro ao filtrar logs')
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível filtrar os logs',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/audit?format=${format}`)
      if (!response.ok) throw new Error('Erro ao exportar logs')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível exportar os logs',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  }

  const getActionColor = (action: AuditAction): string => {
    switch (action) {
      case 'create':
        return 'green'
      case 'update':
        return 'blue'
      case 'delete':
        return 'red'
      case 'login':
      case 'logout':
        return 'purple'
      default:
        return 'gray'
    }
  }

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center">
          <Spinner size="xl" />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Logs de Auditoria</Heading>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              leftIcon={<DownloadIcon />}
            >
              Exportar
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleExport('csv')}>CSV</MenuItem>
              <MenuItem onClick={() => handleExport('json')}>JSON</MenuItem>
            </MenuList>
          </Menu>
        </HStack>

        <Box p={4} borderWidth={1} borderRadius="md">
          <VStack spacing={4}>
            <HStack width="100%">
              <FormControl>
                <FormLabel>Usuário</FormLabel>
                <Input
                  value={filters.userId}
                  onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                  placeholder="ID do usuário"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Ação</FormLabel>
                <Select
                  value={filters.action}
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                >
                  <option value="">Todas</option>
                  <option value="create">Criar</option>
                  <option value="update">Atualizar</option>
                  <option value="delete">Excluir</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Recurso</FormLabel>
                <Select
                  value={filters.resource}
                  onChange={(e) => setFilters({ ...filters, resource: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="user">Usuário</option>
                  <option value="appointment">Agendamento</option>
                  <option value="service">Serviço</option>
                  <option value="product">Produto</option>
                  <option value="client">Cliente</option>
                  <option value="payment">Pagamento</option>
                  <option value="settings">Configurações</option>
                  <option value="backup">Backup</option>
                  <option value="system">Sistema</option>
                </Select>
              </FormControl>
            </HStack>
            <HStack width="100%">
              <FormControl>
                <FormLabel>Data Inicial</FormLabel>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Data Final</FormLabel>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </FormControl>
              <Button
                colorScheme="blue"
                onClick={handleFilter}
                alignSelf="flex-end"
              >
                Filtrar
              </Button>
            </HStack>
          </VStack>
        </Box>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Data/Hora</Th>
                <Th>Usuário</Th>
                <Th>Ação</Th>
                <Th>Recurso</Th>
                <Th>Detalhes</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {logs.map((log) => (
                <Tr key={log.id}>
                  <Td>{new Date(log.timestamp).toLocaleString('pt-BR')}</Td>
                  <Td>
                    <Text>{log.userName}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {log.userRole}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                  </Td>
                  <Td>{log.resource}</Td>
                  <Td>{log.details}</Td>
                  <Td>
                    <IconButton
                      aria-label="Ver detalhes"
                      icon={<ChevronDownIcon />}
                      size="sm"
                      onClick={() => {
                        setSelectedLog(log)
                        onDetailsOpen()
                      }}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      {/* Modal de Detalhes */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detalhes do Log</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedLog && (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold">Data/Hora</Text>
                  <Text>{new Date(selectedLog.timestamp).toLocaleString('pt-BR')}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Usuário</Text>
                  <Text>{selectedLog.userName} ({selectedLog.userRole})</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Ação</Text>
                  <Badge colorScheme={getActionColor(selectedLog.action)}>
                    {selectedLog.action}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold">Recurso</Text>
                  <Text>{selectedLog.resource}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Detalhes</Text>
                  <Text>{selectedLog.details}</Text>
                </Box>
                {selectedLog.changes && (
                  <Box>
                    <Text fontWeight="bold">Alterações</Text>
                    <Box p={4} bg="gray.50" borderRadius="md">
                      <Text fontWeight="semibold">Antes:</Text>
                      <Text as="pre" fontSize="sm">
                        {JSON.stringify(selectedLog.changes.before, null, 2)}
                      </Text>
                      <Text fontWeight="semibold" mt={2}>Depois:</Text>
                      <Text as="pre" fontSize="sm">
                        {JSON.stringify(selectedLog.changes.after, null, 2)}
                      </Text>
                    </Box>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDetailsClose}>Fechar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
} 