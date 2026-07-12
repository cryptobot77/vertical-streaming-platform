import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="text-center animate-fadeIn">
        <div className="text-8xl font-bold text-white/10 mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Page not found</h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary px-8">
            Go Home
          </Link>
          <Link href="/discover" className="btn-secondary px-8">
            Browse Content
          </Link>
        </div>
      </div>
    </div>
  )
}
