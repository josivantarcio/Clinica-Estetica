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
  Select,
  VStack,
  useToast,
  Badge,
  Text,
  Progress,
} from '@chakra-ui/react'
import { FiPlus, FiEdit2, FiTrash2, FiGift } from 'react-icons/fi'
import { useState, useEffect } from 'react'

interface LoyaltyProgram {
  id: string
  name: string
  points: number
  level: string
  totalSpent: number
  nextLevel: string
  pointsToNextLevel: number
}

interface Reward {
  id: string
  name: string
  points: number
  description: string
  active: boolean
}

export default function FidelidadePage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [formData, setFormData] = useState({
    name: '',
    points: 0,
    description: '',
  })
  const toast = useToast()

  // Carregar programas de fidelidade
  const loadLoyaltyPrograms = async () => {
    try {
      const response = await fetch('/api/loyalty')
      const data = await response.json()
      setLoyaltyPrograms(data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar programas de fidelidade',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Carregar recompensas
  const loadRewards = async () => {
    try {
      const response = await fetch('/api/loyalty/rewards')
      const data = await response.json()
      setRewards(data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar recompensas',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  useEffect(() => {
    loadLoyaltyPrograms()
    loadRewards()
  }, [])

  // Função para adicionar/editar recompensa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/loyalty/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }
      
      loadRewards()
      onClose()
      setFormData({
        name: '',
        points: 0,
        description: '',
      })
      
      toast({
        title: 'Recompensa criada com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erro ao criar recompensa',
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Função para excluir recompensa
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/loyalty/rewards/${id}`, {
        method: 'DELETE',
      })
      loadRewards()
      toast({
        title: 'Recompensa excluída com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erro ao excluir recompensa',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading>Programa de Fidelidade</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          onClick={onOpen}
        >
          Nova Recompensa
        </Button>
      </Flex>

      <Box
        bg={useColorModeValue('white', 'gray.700')}
        p={6}
        rounded="lg"
        shadow="xl"
        mb={8}
      >
        <Heading size="md" mb={4}>Clientes Fidelizados</Heading>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Cliente</Th>
              <Th>Nível</Th>
              <Th>Pontos</Th>
              <Th>Total Gasto</Th>
              <Th>Próximo Nível</Th>
              <Th>Progresso</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loyaltyPrograms.map((program) => (
              <Tr key={program.id}>
                <Td>{program.name}</Td>
                <Td>
                  <Badge
                    colorScheme={
                      program.level === 'Bronze' ? 'orange' :
                      program.level === 'Prata' ? 'gray' :
                      program.level === 'Ouro' ? 'yellow' :
                      'purple'
                    }
                  >
                    {program.level}
                  </Badge>
                </Td>
                <Td>{program.points}</Td>
                <Td>R$ {program.totalSpent.toFixed(2)}</Td>
                <Td>{program.nextLevel}</Td>
                <Td>
                  <Box>
                    <Progress
                      value={(program.points / program.pointsToNextLevel) * 100}
                      colorScheme="brand"
                      size="sm"
                      mb={1}
                    />
                    <Text fontSize="sm" color="gray.500">
                      {program.points} / {program.pointsToNextLevel} pontos
                    </Text>
                  </Box>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Box
        bg={useColorModeValue('white', 'gray.700')}
        p={6}
        rounded="lg"
        shadow="xl"
      >
        <Heading size="md" mb={4}>Recompensas Disponíveis</Heading>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Recompensa</Th>
              <Th>Pontos Necessários</Th>
              <Th>Descrição</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rewards.map((reward) => (
              <Tr key={reward.id}>
                <Td>{reward.name}</Td>
                <Td>{reward.points}</Td>
                <Td>{reward.description}</Td>
                <Td>
                  <Badge
                    colorScheme={reward.active ? 'green' : 'red'}
                  >
                    {reward.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Editar recompensa"
                      icon={<FiEdit2 />}
                      size="sm"
                      colorScheme="blue"
                    />
                    <IconButton
                      aria-label="Excluir recompensa"
                      icon={<FiTrash2 />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(reward.id)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modal de Recompensa */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nova Recompensa</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nome da Recompensa</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Pontos Necessários</FormLabel>
                  <Input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Descrição</FormLabel>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </FormControl>

                <Button type="submit" colorScheme="brand" width="full">
                  Salvar Recompensa
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
} 