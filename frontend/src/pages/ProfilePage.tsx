import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userService } from '@/api/userService';
import { useAuthStore } from '@/store/useAuthStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Camera, 
  Save, 
  Loader2,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
});

type ProfileValues = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const { toast } = useToast();
  const { user: authUser, setAuth } = useAuthStore();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber || '',
        password: '',
      });
      if (profile.avatarUrl) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3010';
        setPreviewUrl(`${baseUrl}${profile.avatarUrl}`);
      }
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => userService.updateProfile(formData),
    onSuccess: (updatedUser) => {
      // Update global auth store
      setAuth(updatedUser, localStorage.getItem('accessToken')!, localStorage.getItem('refreshToken')!);
      toast({ title: 'Profile updated successfully' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.response?.data?.error || 'Something went wrong',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data: ProfileValues) => {
    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
    if (data.password) formData.append('password', data.password);
    if (avatarFile) formData.append('avatar', avatarFile);

    mutation.mutate(formData);
  };

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Personal Settings</h2>
            <p className="text-sm text-slate-500 mt-1">Update your profile information and account preferences.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar Upload */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center space-y-6">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 ring-2 ring-slate-100">
                {previewUrl ? (
                  <img src={previewUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-300">
                    <User className="h-16 w-16" />
                  </div>
                )}
              </div>
              <label 
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="h-8 w-8 text-white" />
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-lg">{profile?.firstName} {profile?.lastName}</h3>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{profile?.role}</p>
            </div>

            <div className="w-full pt-4 space-y-3">
               <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Verified Account Member</span>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-8 space-y-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                    <Input 
                      placeholder="e.g., Alex" 
                      className="bg-slate-50 border-slate-100 h-11 text-sm font-medium focus:bg-white transition-all" 
                      {...register('firstName')}
                    />
                    {errors.firstName && <p className="text-[10px] text-rose-500 font-bold">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                    <Input 
                      placeholder="e.g., Rivera" 
                      className="bg-slate-50 border-slate-100 h-11 text-sm font-medium focus:bg-white transition-all" 
                      {...register('lastName')}
                    />
                    {errors.lastName && <p className="text-[10px] text-rose-500 font-bold">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="email"
                      placeholder="alex@tasksuite.com" 
                      className="pl-10 bg-slate-50 border-slate-100 h-11 text-sm font-medium focus:bg-white transition-all" 
                      {...register('email')}
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-rose-500 font-bold">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="+1 (555) 000-0000" 
                      className="pl-10 bg-slate-50 border-slate-100 h-11 text-sm font-medium focus:bg-white transition-all" 
                      {...register('phoneNumber')}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Change Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="password"
                        placeholder="Leave blank to keep current password" 
                        className="pl-10 bg-slate-50 border-slate-100 h-11 text-sm font-medium focus:bg-white transition-all" 
                        {...register('password')}
                      />
                    </div>
                    {errors.password && <p className="text-[10px] text-rose-500 font-bold">{errors.password.message}</p>}
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-3">
                  <Button 
                    type="submit" 
                    className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold h-11 px-8 shadow-lg shadow-blue-200 transition-all active:scale-95"
                    disabled={mutation.isPending || (!isDirty && !avatarFile)}
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
