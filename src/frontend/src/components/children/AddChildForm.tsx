import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ImageUpload } from './ImageUpload';

const addChildSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal(''))
});

type AddChildFormData = z.infer<typeof addChildSchema>;

interface AddChildFormProps {
  onSuccess?: () => void;
}

export function AddChildForm({ onSuccess }: AddChildFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AddChildFormData>({
    resolver: zodResolver(addChildSchema)
  });

  const onSubmit = async (data: AddChildFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add child');
      }

      toast({
        title: 'Success!',
        description: 'Child added successfully'
      });

      reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add child',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add a Child</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter child's name"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age (optional)</Label>
            <Input
              id="age"
              type="number"
              {...register('age')}
              placeholder="Enter child's age"
              disabled={isLoading}
            />
            {errors.age && (
              <p className="text-sm text-red-500">{errors.age.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
            <Input
              id="avatarUrl"
              {...register('avatarUrl')}
              placeholder="Enter avatar URL"
              disabled={isLoading}
            />
            {errors.avatarUrl && (
              <p className="text-sm text-red-500">{errors.avatarUrl.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Child'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 