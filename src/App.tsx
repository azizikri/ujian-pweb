import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { TableSkeleton } from './components/ui/table-skeleton';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const formSchema = z.object({
  name: z.string().min(5).max(50),
  username: z.string().min(3).max(20),
  email: z.string().email(),
});

export type UserData = {
  id: number;
  name: string;
  username: string;
  email: string;
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<UserData[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
    },
  });

  const { formState } = form;

  useEffect(() => {
    fetchData();
  }, []);

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/users'
      );
      const data: UserData[] = await response.json();
      setTableData(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error!',
        description: 'There was a problem with your request, please try again.',
      });
    }
  };

  const handleSubmitForm = async (values: z.infer<typeof formSchema>) => {
    const { name, username, email } = values;

    if (name && username && email) {
      const newData: UserData = { name, username, email } as UserData;

      try {
        const response = await fetch(
          'https://jsonplaceholder.typicode.com/users',
          {
            method: 'POST',
            body: JSON.stringify(newData),
            headers: {
              'Content-Type': 'application/json; charset=UTF-8',
            },
          }
        );

        const data: UserData = await response.json();
        setTableData([...tableData, data]);

        form.setValue('name', '');
        form.setValue('username', '');
        form.setValue('email', '');

        toast({
          title: 'User Added',
          description: `${data.name} is successfully added!`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error!',
          description:
            'There was a problem with your request, please try again.',
        });
      }
    }
  };

  const handleEdit = (id: number) => {
    const updateUser = tableData.find((data) => data.id === id);

    if (updateUser) {
      form.setValue('name', updateUser.name);
      form.setValue('username', updateUser.username);
      form.setValue('email', updateUser.email);

      setEditingId(id);
    }
  };

  const handleCancelUpdate = () => {
    setEditingId(null);
    form.setValue('name', '');
    form.setValue('username', '');
    form.setValue('email', '');
  };

  const handleUpdate = async (values: z.infer<typeof formSchema>) => {
    const { name, username, email } = values;

    if (name && username && email && editingId !== null) {
      const updateUser: UserData = {
        name,
        username,
        email,
        id: editingId,
      } as UserData;

      try {
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/users/${editingId}`,
          {
            method: 'PUT',
            body: JSON.stringify(updateUser),
            headers: {
              'Content-Type': 'application/json; charset=UTF-8',
            },
          }
        );

        console.log(response);

        const data: UserData = await response.json();
        const updatedUser = tableData.map((user) =>
          user.id === editingId ? data : user
        );

        setTableData(updatedUser);

        form.setValue('name', '');
        form.setValue('username', '');
        form.setValue('email', '');

        setEditingId(null);

        toast({
          title: 'User Updated',
          description: `${data.name} is successfully updated!`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error!',
          description:
            'There was a problem with your request, please try again.',
        });
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
        method: 'DELETE',
      });

      const deletedData = tableData.filter((data) => data.id !== id);

      setTableData(deletedData);

      toast({
        title: 'User Deleted',
        description: `User is successfully deleted!`,
      });

      setIsLoading(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error!',
        description: 'There was a problem with your request, please try again.',
      });
    }
  };

  // console.log(tableData);

  return (
    <>
      <div className="container py-4 mx-auto">
     <h1 className="py-5 text-4xl font-extrabold tracking-tight scroll-m-20 lg:text-5xl">
        User Management App
      </h1>
        <div className="pb-5">
          <Form {...form}>
            <form
              onSubmit={
                editingId == null
                  ? form.handleSubmit(handleSubmitForm)
                  : form.handleSubmit(handleUpdate)
              }
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the name"
                        {...field}
                        onChange={(e) => {
                          form.setValue('name', e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>This is the full name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the username"
                        {...field}
                        onChange={(e) => {
                          form.setValue('username', e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the email"
                        {...field}
                        onChange={(e) => {
                          form.setValue('email', e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>This is the email.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-x-5">
                {formState.isSubmitting ? (
                  <Button disabled>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Please wait
                  </Button>
                ) : (
                  <Button type="submit">
                    {editingId == null ? 'Submit' : 'Update'}
                  </Button>
                )}
                {editingId != null && (
                  <Button type="button" onClick={handleCancelUpdate}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>


        <Table>
          <TableCaption>A list of users.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formState.isSubmitting || isLoading ? (
              <TableSkeleton />
            ) : (
              tableData.map((data, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{data.name}</TableCell>
                    <TableCell>{data.username}</TableCell>
                    <TableCell>{data.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-x-5">
                        <div className="flex-initial">
                          <Button onClick={() => handleEdit(data.id)}>
                            Update
                          </Button>
                        </div>
                        <div className="flex-initial">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive">Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete this data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(data.id)}
                                >
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default App;
