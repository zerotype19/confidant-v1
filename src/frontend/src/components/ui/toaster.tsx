import { useToast } from '@chakra-ui/toast';

interface ToastOptions {
  title?: string;
  description: string;
  type: 'info' | 'success' | 'error' | 'loading';
}

export const toaster = {
  create: (options: ToastOptions) => {
    const toast = useToast();
    toast({
      title: options.title,
      description: options.description,
      status: options.type === 'loading' ? 'info' : options.type,
      duration: options.type === 'loading' ? null : 5000,
      isClosable: options.type !== 'loading',
    });
  },
};

export function Toaster() {
  return null;
}
