'use client';

import * as React from 'react';

import Image from 'next/image';

import {
  IconCircleCheck,
  IconCircleX,
  IconCopy,
  IconDeviceMobile,
  IconShield,
} from '@tabler/icons-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface TwoFactorSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TwoFactorSetupDialog({ open, onOpenChange }: TwoFactorSetupDialogProps) {
  const [step, setStep] = React.useState<'info' | 'scan' | 'verify' | 'backup' | 'complete'>(
    'info'
  );
  const [verificationCode, setVerificationCode] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [error, setError] = React.useState('');
  const verificationCodeId = React.useId();

  // Mock data - in production, this would come from your backend
  const qrCodeUrl = 'https://via.placeholder.com/200x200?text=QR+Code';
  const secretKey = 'JBSWY3DPEHPK3PXP';
  const backupCodes = [
    '1234-5678',
    '2345-6789',
    '3456-7890',
    '4567-8901',
    '5678-9012',
    '6789-0123',
    '7890-1234',
    '8901-2345',
  ];

  const handleVerify = async () => {
    setIsVerifying(true);
    setError('');

    // Mock verification - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (verificationCode === '123456') {
      setStep('backup');
    } else {
      setError('Invalid verification code. Please try again.');
    }

    setIsVerifying(false);
  };

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
  };

  const handleReset = () => {
    setStep('info');
    setVerificationCode('');
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'info' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IconShield className="size-5" />
                Enable Two-Factor Authentication
              </DialogTitle>
              <DialogDescription>
                Add an extra layer of security to your account with 2FA
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert>
                <IconDeviceMobile className="size-4" />
                <AlertDescription>
                  You&apos;ll need an authenticator app like Google Authenticator, Authy, or
                  1Password to scan the QR code.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">How it works:</h4>
                <ol className="ml-4 list-decimal space-y-1 text-sm text-muted-foreground">
                  <li>Scan the QR code with your authenticator app</li>
                  <li>Enter the 6-digit code from your app</li>
                  <li>Save your backup codes in a safe place</li>
                </ol>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep('scan')}>Get Started</Button>
            </DialogFooter>
          </>
        )}

        {step === 'scan' && (
          <>
            <DialogHeader>
              <DialogTitle>Scan QR Code</DialogTitle>
              <DialogDescription>Use your authenticator app to scan this QR code</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <div className="rounded-lg border p-4">
                  <div className="relative size-48">
                    <Image
                      src={qrCodeUrl}
                      alt="QR Code for 2FA setup"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-normal text-muted-foreground">
                  Can&apos;t scan? Enter this key manually:
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-sm">
                    {secretKey}
                  </code>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(secretKey)}>
                    <IconCopy className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleReset}>
                Back
              </Button>
              <Button onClick={() => setStep('verify')}>Next</Button>
            </DialogFooter>
          </>
        )}

        {step === 'verify' && (
          <>
            <DialogHeader>
              <DialogTitle>Verify Setup</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code from your authenticator app
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor={verificationCodeId}>Verification Code</Label>
                <Input
                  id={verificationCodeId}
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <IconCircleX className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('scan')}>
                Back
              </Button>
              <Button
                onClick={handleVerify}
                disabled={verificationCode.length !== 6 || isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'backup' && (
          <>
            <DialogHeader>
              <DialogTitle>Save Your Backup Codes</DialogTitle>
              <DialogDescription>
                Store these codes in a safe place. You can use them to access your account if you
                lose your device.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert>
                <IconShield className="size-4" />
                <AlertDescription className="font-medium">
                  Each code can only be used once. Keep them secure!
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code) => (
                  <div
                    key={code}
                    className="flex items-center justify-between rounded border bg-muted px-3 py-2"
                  >
                    <code className="font-mono text-sm">{code}</code>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
              >
                <IconCopy className="mr-2 size-4" />
                Copy All Codes
              </Button>
            </div>

            <DialogFooter>
              <Button onClick={() => setStep('complete')} className="w-full">
                I&apos;ve Saved My Backup Codes
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'complete' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IconCircleCheck className="size-5 text-green-600" />
                2FA Enabled Successfully
              </DialogTitle>
              <DialogDescription>
                Your account is now protected with two-factor authentication
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Alert>
                <IconShield className="size-4" />
                <AlertDescription>
                  From now on, you&apos;ll need to enter a code from your authenticator app when
                  signing in.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function TwoFactorManagement() {
  const [is2FAEnabled, setIs2FAEnabled] = React.useState(false);
  const [showSetupDialog, setShowSetupDialog] = React.useState(false);

  const handleDisable2FA = () => {
    // In production, this would call an API
    setIs2FAEnabled(false);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          {is2FAEnabled ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <IconCircleCheck className="size-4" />
              Enabled
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconCircleX className="size-4" />
              Disabled
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {is2FAEnabled ? (
            <>
              <Button variant="outline" size="sm">
                View Backup Codes
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDisable2FA}>
                Disable 2FA
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setShowSetupDialog(true)}>
              <IconShield className="mr-2 size-4" />
              Enable 2FA
            </Button>
          )}
        </div>
      </div>

      <TwoFactorSetupDialog
        open={showSetupDialog}
        onOpenChange={(open) => {
          setShowSetupDialog(open);
          if (!open && !is2FAEnabled) {
            // If dialog was closed during setup, consider it enabled
            // In production, check actual status from API
            setIs2FAEnabled(true);
          }
        }}
      />
    </>
  );
}
