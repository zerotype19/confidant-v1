import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Divider,
  HStack,
  Checkbox,
  Container,
} from '@chakra-ui/react'
import { useAuth } from '@/contexts/auth-context'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Invalid email or password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg="gray.50" py={12}>
      <Container maxW="md">
        <VStack spacing={8}>
          <Box textAlign="center">
            <img
              src="/logo.svg"
              alt="Confidant"
              className="mx-auto h-12 w-auto"
            />
            <Heading as="h2" size="xl" mt={6}>
              Sign in to your account
            </Heading>
            <Text mt={2} color="gray.600">
              Don't have an account?{' '}
              <Link to="/signup">
                <Text as="span" color="primary.600" _hover={{ color: 'primary.500' }}>
                  Sign up
                </Text>
              </Link>
            </Text>
          </Box>

          <Box bg="white" py={8} px={4} shadow="sm" rounded="lg">
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Email address</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </FormControl>

                <HStack justify="space-between" w="full">
                  <Checkbox>Remember me</Checkbox>
                  <Button variant="link" color="primary.600">
                    Forgot your password?
                  </Button>
                </HStack>

                <Button
                  type="submit"
                  colorScheme="primary"
                  w="full"
                  isLoading={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </VStack>
            </form>

            <Box mt={6}>
              <Divider />
              <Text textAlign="center" my={4} color="gray.500">
                Or continue with
              </Text>
              <VStack spacing={4}>
                <Button w="full" variant="outline">
                  Continue with Google
                </Button>
                <Button w="full" variant="outline">
                  Continue with GitHub
                </Button>
              </VStack>
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
} 