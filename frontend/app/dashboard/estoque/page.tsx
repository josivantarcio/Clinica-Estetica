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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  useToast,
  Badge,
  Text,
  Select,
} from '@chakra-ui/react'
import { FiPlus, FiEdit2, FiTrash2, FiPackage } from 'react-icons/fi'
import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  category: string
  quantity: number
  minQuantity: number
  unit: string
  price: number
  supplier: string
  lastRestock: string
}

interface Category {
  id: string
  name: string
}

export default function EstoquePage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    minQuantity: 0,
    unit: '',
    price: 0,
    supplier: '',
  })
  const toast = useToast()

  // Carregar produtos
  const loadProducts = async () => {
    try {
      const response = await fetch('/api/inventory')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar produtos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Carregar categorias
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/inventory/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar categorias',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  // Função para adicionar/editar produto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/inventory', {
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
      
      loadProducts()
      onClose()
      setFormData({
        name: '',
        category: '',
        quantity: 0,
        minQuantity: 0,
        unit: '',
        price: 0,
        supplier: '',
      })
      
      toast({
        title: 'Produto salvo com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erro ao salvar produto',
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Função para excluir produto
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      })
      loadProducts()
      toast({
        title: 'Produto excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erro ao excluir produto',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Função para atualizar estoque
  const handleUpdateStock = async (id: string, quantity: number) => {
    try {
      const response = await fetch(`/api/inventory/${id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }
      
      loadProducts()
      toast({
        title: 'Estoque atualizado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erro ao atualizar estoque',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading>Controle de Estoque</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          onClick={onOpen}
        >
          Novo Produto
        </Button>
      </Flex>

      <Box
        bg={useColorModeValue('white', 'gray.700')}
        p={6}
        rounded="lg"
        shadow="xl"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Produto</Th>
              <Th>Categoria</Th>
              <Th>Quantidade</Th>
              <Th>Mínimo</Th>
              <Th>Preço</Th>
              <Th>Fornecedor</Th>
              <Th>Última Reposição</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {products.map((product) => (
              <Tr key={product.id}>
                <Td>{product.name}</Td>
                <Td>{product.category}</Td>
                <Td>
                  <NumberInput
                    size="sm"
                    min={0}
                    value={product.quantity}
                    onChange={(_, value) => handleUpdateStock(product.id, value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Td>
                <Td>{product.minQuantity} {product.unit}</Td>
                <Td>R$ {product.price.toFixed(2)}</Td>
                <Td>{product.supplier}</Td>
                <Td>{new Date(product.lastRestock).toLocaleDateString('pt-BR')}</Td>
                <Td>
                  <Badge
                    colorScheme={
                      product.quantity <= product.minQuantity ? 'red' :
                      product.quantity <= product.minQuantity * 1.5 ? 'yellow' :
                      'green'
                    }
                  >
                    {product.quantity <= product.minQuantity ? 'Baixo' :
                     product.quantity <= product.minQuantity * 1.5 ? 'Médio' :
                     'Adequado'}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Editar produto"
                      icon={<FiEdit2 />}
                      size="sm"
                      colorScheme="blue"
                    />
                    <IconButton
                      aria-label="Excluir produto"
                      icon={<FiTrash2 />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(product.id)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modal de Produto */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Novo Produto</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nome do Produto</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Quantidade Inicial</FormLabel>
                  <NumberInput
                    min={0}
                    value={formData.quantity}
                    onChange={(_, value) => setFormData({ ...formData, quantity: value })}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Quantidade Mínima</FormLabel>
                  <NumberInput
                    min={0}
                    value={formData.minQuantity}
                    onChange={(_, value) => setFormData({ ...formData, minQuantity: value })}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Unidade</FormLabel>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Ex: unidade, kg, litro"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Preço</FormLabel>
                  <NumberInput
                    min={0}
                    precision={2}
                    value={formData.price}
                    onChange={(_, value) => setFormData({ ...formData, price: value })}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Fornecedor</FormLabel>
                  <Input
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </FormControl>

                <Button type="submit" colorScheme="brand" width="full">
                  Salvar Produto
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
} 