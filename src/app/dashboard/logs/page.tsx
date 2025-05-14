import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Input,
  Button,
  HStack,
  VStack,
  Text,
  useToast,
  Badge,
  Flex,
  Spacer
} from '@chakra-ui/react'
import { useLogger, LogLevel, LogCategory, LogStatus } from '@/services/logger'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function LogsPage() {
  const { getLogs, clearLogs } = useLogger()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    level: '' as LogLevel | '',
    category: '' as LogCategory | '',
    startDate: '',
    endDate: '',
    userId: ''
  })
  const toast = useToast()

  const loadLogs = async () => {
    try {
      setLoading(true)
      const logsData = await getLogs({
        level: filters.level || undefined,
        category: filters.category || undefined,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        userId: filters.userId || undefined
      })
      setLogs(logsData)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar logs',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [filters])

  const handleClearLogs = async () => {
    try {
      await clearLogs()
      await loadLogs()
      toast({
        title: 'Sucesso',
        description: 'Logs limpos com sucesso',
        status: 'success',
        duration: 5000,
        isClosable: true
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao limpar logs',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  }

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'info': return 'blue'
      case 'warning': return 'orange'
      case 'error': return 'red'
      default: return 'gray'
    }
  }

  const getStatusColor = (status: LogStatus) => {
    switch (status) {
      case 'success': return 'green'
      case 'failure': return 'red'
      case 'pending': return 'yellow'
      default: return 'gray'
    }
  }

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Flex>
          <Heading size="lg">Logs do Sistema</Heading>
          <Spacer />
          <Button
            colorScheme="red"
            onClick={handleClearLogs}
            isLoading={loading}
          >
            Limpar Logs
          </Button>
        </Flex>

        <HStack spacing={4}>
          <Select
            placeholder="Nível"
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value as LogLevel })}
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </Select>

          <Select
            placeholder="Categoria"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value as LogCategory })}
          >
            <option value="auth">Autenticação</option>
            <option value="user">Usuário</option>
            <option value="appointment">Agendamento</option>
            <option value="service">Serviço</option>
            <option value="inventory">Estoque</option>
            <option value="report">Relatório</option>
            <option value="system">Sistema</option>
          </Select>

          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />

          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />

          <Input
            placeholder="ID do Usuário"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
          />
        </HStack>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Data/Hora</Th>
                <Th>Nível</Th>
                <Th>Categoria</Th>
                <Th>Ação</Th>
                <Th>Descrição</Th>
                <Th>Status</Th>
                <Th>Usuário</Th>
              </Tr>
            </Thead>
            <Tbody>
              {logs.map((log) => (
                <Tr key={log.id}>
                  <Td>
                    {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                  </Td>
                  <Td>
                    <Badge colorScheme={getLevelColor(log.level)}>
                      {log.level}
                    </Badge>
                  </Td>
                  <Td>{log.category}</Td>
                  <Td>{log.action}</Td>
                  <Td>{log.description}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                  </Td>
                  <Td>{log.userId || '-'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {logs.length === 0 && !loading && (
          <Text textAlign="center" color="gray.500">
            Nenhum log encontrado
          </Text>
        )}
      </VStack>
    </Box>
  )
} 