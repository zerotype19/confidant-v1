import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from './ImageUpload';

interface Child {
  id: string;
  name: string;
  age?: number;
  avatar_url?: string;
}

interface EditChildFormData {
  name: string;
  age?: string;
}

const editChildSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.string().optional(),
});

interface EditChildDialogProps {
  child: Child;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditChildDialog({ child, open, onOpenChange, onSuccess }: EditChildDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(child.avatar_url);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditChildFormData>({
    resolver: zodResolver(editChildSchema),
    defaultValues: {
      name: child.name,
      age: child.age?.toString(),
    },
  });

  const onSubmit = async (formData: EditChildFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/children/${child.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          age: formData.age ? parseInt(formData.age, 10) : undefined,
          avatar_url: avatarUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update child');
      }

      toast({
        title: 'Success',
        description: 'Child updated successfully',
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update child',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Child Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar</Label>
            <ImageUpload
              currentImage={avatarUrl}
              onUploadComplete={setAvatarUrl}
              onError={(error) => {
                toast({
                  title: 'Error',
                  description: error,
                  variant: 'destructive',
                });
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register('name')}
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
              disabled={isLoading}
            />
            {errors.age && (
              <p className="text-sm text-red-500">{errors.age.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 