import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SaveConfirmationDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;

  /**
   * Callback when user clicks "Save"
   */
  onSave: () => void | Promise<void>;

  /**
   * Callback when user clicks "Don't Save"
   */
  onDiscard: () => void | Promise<void>;

  /**
   * Callback when user clicks "Cancel"
   */
  onCancel: () => void;

  /**
   * Title of the dialog
   */
  title?: string;

  /**
   * Description of the dialog
   */
  description?: string;

  /**
   * Label for the save button
   */
  saveLabel?: string;

  /**
   * Label for the discard button
   */
  discardLabel?: string;

  /**
   * Whether the save/discard actions are loading
   */
  isLoading?: boolean;
}

export function SaveConfirmationDialog({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
  title = "Unsaved Changes",
  description = "You have unsaved changes. Would you like to save them before leaving?",
  saveLabel = "Save Changes",
  discardLabel = "Don't Save",
  isLoading = false,
}: SaveConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDiscard}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {discardLabel}
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onSave}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Saving..." : saveLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
