import { toast } from "sonner";

export const useToast = () => {
  return {
    toast: {
      success: (message: string, options?: { description?: string; duration?: number }) => {
        return toast.success(message, {
          description: options?.description,
          duration: options?.duration || 4000,
        });
      },
      error: (message: string, options?: { description?: string; duration?: number }) => {
        return toast.error(message, {
          description: options?.description,
          duration: options?.duration || 5000,
        });
      },
      info: (message: string, options?: { description?: string; duration?: number }) => {
        return toast.info(message, {
          description: options?.description,
          duration: options?.duration || 4000,
        });
      },
      warning: (message: string, options?: { description?: string; duration?: number }) => {
        return toast.warning(message, {
          description: options?.description,
          duration: options?.duration || 4000,
        });
      },
      loading: (message: string) => {
        return toast.loading(message);
      },
      dismiss: (toastId?: string | number) => {
        return toast.dismiss(toastId);
      },
    },
  };
};
