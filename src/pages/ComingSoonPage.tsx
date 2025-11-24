import { Construction } from 'lucide-react';
import { PageContainer } from '@/components/PageContainer';

type ComingSoonPageProps = {
    title?: string;
    message?: string;
};

export default function ComingSoonPage({
    title = 'Coming Soon',
    message = 'This feature is currently under development. Check back soon!',
}: ComingSoonPageProps) {
    return (
        <PageContainer centered>
            <div className="flex max-w-lg flex-col items-center px-4 text-center">
                <div className="bg-disrupt-50 dark:bg-disrupt-900 mb-8 rounded-full p-6">
                    <Construction
                        className="text-disrupt-500 h-16 w-16"
                        strokeWidth={1.5}
                        aria-hidden="true"
                    />
                </div>

                <h1 className="text-warm-black-500 mb-4 text-4xl font-bold dark:text-white">
                    {title}
                </h1>

                <p className="text-warm-black-400 dark:text-warm-black-300 text-lg">{message}</p>

                <div className="bg-disrupt-500 mt-8 h-1 w-24 rounded-full" />
            </div>
        </PageContainer>
    );
}
