'use client';

import { ClientForm } from '@/components/business-center/forms';
import { createClientAction } from '@/lib/actions/business-center/clients';

export function NewClientForm() {
  return (
    <ClientForm
      mode="create"
      redirectPath="/dashboard/business-center/clients"
      onSubmit={createClientAction}
    />
  );
}
