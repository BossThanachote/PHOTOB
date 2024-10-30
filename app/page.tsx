'use client'
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <main className="app transition-all ease-in flex justify-center items-center h-full">
        <div className="button-container" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            onClick={() => router.push('/event')}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Go to Event
          </button>
          <button
            onClick={() => router.push('/booth')}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Go to Booth
          </button>
        </div>
      </main>
    </>
  );
}
