import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function TaxLossHarvesting({ title }: { title?: string }) {
    return (
        <AppLayout>
            <Head title={title || 'Tax-Loss Harvesting'} />
            <div className="p-6">
                <h1 className="text-2xl font-bold">Tax-Loss Harvesting</h1>
                <p className="mt-4">This page will guide you through harvesting tax losses.</p>
            </div>
        </AppLayout>
    );
}
