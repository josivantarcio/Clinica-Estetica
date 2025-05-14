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
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Text,
  Badge,
  HStack,
  VStack,
  Spinner
} from '@chakra-ui/react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface BackupMetadata {
  id: string
  timestamp: Date
  size: number
  status: 'success' | 'failed'
  error?: string
}

interface BackupConfig {
  schedule: string
  retentionDays: number
  compression: boolean
  storagePath: string
}

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupMetadata[]>([])
  const [config, setConfig] = useState<BackupConfig>({
    schedule: '0 0 * * *',
    retentionDays: 30,
    compression: true,
    storagePath: ''
  })
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<BackupMetadata | null>(null)
  
  const { isOpen: isConfigOpen, onOpen: onConfigOpen, onClose: onConfigClose } = useDisclosure()
  const { isOpen: isRestoreOpen, onOpen: onRestoreOpen, onClose: onRestoreClose } = useDisclosure()
  const cancelRef = React.useRef()
  
  const toast = useToast()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    loadBackups()
    loadConfig()
  }, [user, router])

  const loadBackups = async () => {
    try {
      const response = await fetch('/api/backup')
      if (!response.ok) throw new Error('Erro ao carregar backups')
      const data = await response.json()
      setBackups(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os backups',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/backup')
      if (!response.ok) throw new Error('Erro ao carregar configurações')
      const data = await response.json()
      setConfig(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  }

  const handleCreateBackup = async () => {
    setCreating(true)
    try {
      const response = await fetch('/api/backup', {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Erro ao criar backup')
      
      toast({
        title: 'Sucesso',
        description: 'Backup criado com sucesso',
        status: 'success',
        duration: 5000,
        isClosable: true
      })
      
      await loadBackups()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o backup',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setCreating(false)
    }
  }

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return
    
    setRestoring(true)
    try {
      const response = await fetch('/api/backup', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore',
          backupId: selectedBackup.id
        })
      })
      
      if (!response.ok) throw new Error('Erro ao restaurar backup')
      
      toast({
        title: 'Sucesso',
        description: 'Backup restaurado com sucesso',
        status: 'success',
        duration: 5000,
        isClosable: true
      })
      
      onRestoreClose()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível restaurar o backup',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    } finally {
      setRestoring(false)
    }
  }

  const handleUpdateConfig = async () => {
    try {
      const response = await fetch('/api/backup', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateConfig',
          config
        })
      })
      
      if (!response.ok) throw new Error('Erro ao atualizar configurações')
      
      toast({
        title: 'Sucesso',
        description: 'Configurações atualizadas com sucesso',
        status: 'success',
        duration: 5000,
        isClosable: true
      })
      
      onConfigClose()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as configurações',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
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
          <Heading size="lg">Gerenciamento de Backup</Heading>
          <HStack>
            <Button
              colorScheme="blue"
              onClick={handleCreateBackup}
              isLoading={creating}
            >
              Criar Backup
            </Button>
            <Button onClick={onConfigOpen}>
              Configurações
            </Button>
          </HStack>
        </HStack>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Data</Th>
                <Th>Tamanho</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {backups.map((backup) => (
                <Tr key={backup.id}>
                  <Td>{backup.id}</Td>
                  <Td>{new Date(backup.timestamp).toLocaleString('pt-BR')}</Td>
                  <Td>{formatFileSize(backup.size)}</Td>
                  <Td>
                    <Badge
                      colorScheme={backup.status === 'success' ? 'green' : 'red'}
                    >
                      {backup.status === 'success' ? 'Sucesso' : 'Falha'}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => {
                        setSelectedBackup(backup)
                        onRestoreOpen()
                      }}
                      isDisabled={backup.status === 'failed'}
                    >
                      Restaurar
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      {/* Modal de Configurações */}
      <Modal isOpen={isConfigOpen} onClose={onConfigClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Configurações de Backup</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Agendamento (Cron)</FormLabel>
                <Input
                  value={config.schedule}
                  onChange={(e) => setConfig({ ...config, schedule: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Dias de Retenção</FormLabel>
                <NumberInput
                  value={config.retentionDays}
                  onChange={(_, value) => setConfig({ ...config, retentionDays: value })}
                  min={1}
                  max={365}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Compressão</FormLabel>
                <Switch
                  isChecked={config.compression}
                  onChange={(e) => setConfig({ ...config, compression: e.target.checked })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Caminho de Armazenamento</FormLabel>
                <Input
                  value={config.storagePath}
                  onChange={(e) => setConfig({ ...config, storagePath: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onConfigClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleUpdateConfig}>
              Salvar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Confirmação de Restauração */}
      <AlertDialog
        isOpen={isRestoreOpen}
        leastDestructiveRef={cancelRef}
        onClose={onRestoreClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Restaurar Backup
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text>
                Tem certeza que deseja restaurar o backup de{' '}
                {selectedBackup && new Date(selectedBackup.timestamp).toLocaleString('pt-BR')}?
              </Text>
              <Text mt={2} color="red.500">
                Atenção: Esta ação irá substituir todos os dados atuais pelos dados do backup.
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onRestoreClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={handleRestoreBackup}
                ml={3}
                isLoading={restoring}
              >
                Restaurar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  )
} 