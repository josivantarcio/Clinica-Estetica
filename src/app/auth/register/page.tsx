'use client'

import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  Link as ChakraLink,
  Select,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useState } from 'react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    documento: '',
    plano: 'basico',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('As senhas não coincidem')
      }

      // TODO: Implement registration logic with AWS Cognito and create clinic
      console.log('Registration attempt:', formData)
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack spacing="8">
        <Stack spacing="6">
          <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
            <Heading size={{ base: 'xs', md: 'sm' }}>
              Crie sua conta
            </Heading>
            <Text color="gray.600">
              Já tem uma conta?{' '}
              <ChakraLink as={Link} href="/auth/login" color="brand.500">
                Entre aqui
              </ChakraLink>
            </Text>
          </Stack>
        </Stack>

        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing="6">
              <Stack spacing="5">
                <FormControl isRequired>
                  <FormLabel htmlFor="nome">Nome da Clínica</FormLabel>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel htmlFor="documento">CNPJ</FormLabel>
                  <Input
                    id="documento"
                    name="documento"
                    value={formData.documento}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel htmlFor="plano">Plano</FormLabel>
                  <Select
                    id="plano"
                    name="plano"
                    value={formData.plano}
                    onChange={handleChange}
                  >
                    <option value="basico">Básico (R$99/mês)</option>
                    <option value="premium">Premium (R$199/mês)</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel htmlFor="password">Senha</FormLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel htmlFor="confirmPassword">Confirmar Senha</FormLabel>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </FormControl>
              </Stack>

              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
              >
                Criar Conta
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  )
} 