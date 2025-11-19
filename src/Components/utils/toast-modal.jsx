// src/components/ui/toast-modal.jsx
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Toast Notification Component
export const Toast = ({ message, type = 'success', isOpen, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  };

  return (
    <div 
      className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2"
      role="alert"
      aria-live="polite"
    >
      <div className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg ${bgColors[type]} max-w-md`}>
        {icons[type]}
        <p className="text-sm font-medium text-theme flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-secondary hover:text-theme transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Confirm Dialog Component
export const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive'
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card-theme border-theme sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-theme">{title}</DialogTitle>
          <DialogDescription className="text-secondary">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full sm:w-auto"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ✅ NEW: Warning Dialog Component (for publishing validation)
export const WarningDialog = ({ 
  isOpen, 
  onClose, 
  title = 'Warning',
  description = 'Please address the following issue.',
  icon: Icon = AlertTriangle
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card-theme border-theme sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <Icon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <DialogTitle className="text-theme">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-secondary">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Custom Hook for Toast
export const useToast = () => {
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isOpen: false }));
  };

  return { toast, showToast, closeToast };
};

// Custom Hook for Confirm Dialog
export const useConfirm = () => {
  const [confirm, setConfirm] = useState({ 
    isOpen: false, 
    title: '', 
    description: '',
    onConfirm: () => {} 
  });

  const showConfirm = (title, description, onConfirm) => {
    setConfirm({ isOpen: true, title, description, onConfirm });
  };

  const closeConfirm = () => {
    setConfirm(prev => ({ ...prev, isOpen: false }));
  };

  return { confirm, showConfirm, closeConfirm };
};

// ✅ NEW: Custom Hook for Warning Dialog
export const useWarning = () => {
  const [warning, setWarning] = useState({ 
    isOpen: false, 
    title: '', 
    description: ''
  });

  const showWarning = (title, description) => {
    setWarning({ isOpen: true, title, description });
  };

  const closeWarning = () => {
    setWarning(prev => ({ ...prev, isOpen: false }));
  };

  return { warning, showWarning, closeWarning };
};