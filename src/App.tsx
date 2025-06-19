import Button from '@/components/ui/Button';
import WizardDialog from '@/components/wizardDialog/WizardDialog';
import { Dialog, DialogBackdrop } from '@headlessui/react';
import { useState } from 'react';

export default function App() {
  const [open, setOpen] = useState(false);

  const handleSaveDraft = () => {
    console.log('Draft saved successfully!');
    setOpen(false);
  };

  const handleSaveAndFinishLater = () => {
    console.log('Progress saved, finishing later');
    setOpen(false);
  };

  const handleClose = () => {
    console.log('Dialog closed');
    setOpen(false);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-screen-sm flex-col items-center justify-center gap-8 p-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-medium">Hudu Wizard</h1>
        <p>To Get Started, click on the button below.</p>
      </div>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>

      <Dialog open={open} onClose={() => null} className="relative z-10">
        <DialogBackdrop
          transition
          className="bg-bg-neutral-light-2 fixed inset-0 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <WizardDialog
            onClose={handleClose}
            onSaveDraft={handleSaveDraft}
            onSaveAndFinishLater={handleSaveAndFinishLater}
          />
        </div>
      </Dialog>
    </div>
  );
}
