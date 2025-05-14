'use client'

import {
  Box,
  Flex,
  Heading,
  Button,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi'
import { useState, useEffect } from 'react'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  birthDate: string
  address: string
  notes: string
}

export default function ClientesPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<Partial<Client>>({})
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const toast = useToast()

  // Carregar clientes
  const loadClients = async () => {
    try {
      const response = await fetch(`/api/clients${searchTerm ? `?search=${searchTerm}` : ''}`)
      const data = await response.json()
      setClients(data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar clientes',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  useEffect(() => {
    loadClients()
  }, [searchTerm])

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })
      loadClients()
      toast({
        title: 'Cliente excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erro ao excluir cliente',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData(client)
    onOpen()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingClient ? 'PUT' : 'POST'
      const url = editingClient 
        ? `/api/clients/${editingClient.id}`
        : '/api/clients'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }
      
      loadClients()
      onClose()
      setFormData({})
      setEditingClient(null)
      
      toast({
        title: `Cliente ${editingClient ? 'atualizado' : 'criado'} com sucesso`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: `Erro ao ${editingClient ? 'atualizar' : 'criar'} cliente`,
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading>Clientes</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          onClick={() => {
            setEditingClient(null)
            setFormData({})
            onOpen()
          }}
        >
          Novo Cliente
        </Button>
      </Flex>

      <Box
        bg={useColorModeValue('white', 'gray.700')}
        p={6}
        rounded="lg"
        shadow="xl"
        mb={8}
      >
        <InputGroup mb={4}>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Nome</Th>
              <Th>Email</Th>
              <Th>Telefone</Th>
              <Th>Data de Nascimento</Th>
              <Th>Endereço</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {clients.map((client) => (
              <Tr key={client.id}>
                <Td>{client.name}</Td>
                <Td>{client.email}</Td>
                <Td>{client.phone}</Td>
                <Td>{new Date(client.birthDate).toLocaleDateString('pt-BR')}</Td>
                <Td>{client.address}</Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Editar cliente"
                      icon={<FiEdit2 />}
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleEdit(client)}
                    />
                    <IconButton
                      aria-label="Excluir cliente"
                      icon={<FiTrash2 />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(client.id)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modal de Cliente */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nome</FormLabel>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Telefone</FormLabel>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <Input
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Endereço</FormLabel>
                  <Input
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Observações</FormLabel>
                  <Textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </FormControl>

                <Button type="submit" colorScheme="brand" width="full">
                  {editingClient ? 'Atualizar Cliente' : 'Salvar Cliente'}
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
} 