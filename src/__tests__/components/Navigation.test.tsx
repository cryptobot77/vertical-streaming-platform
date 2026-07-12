import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Navigation from '@/components/Navigation'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn(),
    },
  }),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the StreamVault logo', () => {
    render(<Navigation />)
    expect(screen.getByText('StreamVault')).toBeTruthy()
  })

  it('should show Feed and Discover links', () => {
    render(<Navigation />)
    const feedLinks = screen.getAllByText('Feed')
    const discoverLinks = screen.getAllByText('Discover')
    expect(feedLinks.length).toBeGreaterThanOrEqual(1)
    expect(discoverLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('should show Login and Sign Up when not authenticated', async () => {
    render(<Navigation />)
    await waitFor(() => {
      const loginLinks = screen.getAllByText('Login')
      expect(loginLinks.length).toBeGreaterThanOrEqual(1)
    })
    const signupLinks = screen.getAllByText('Sign Up')
    expect(signupLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('should render mobile menu button', () => {
    render(<Navigation />)
    expect(screen.getByLabelText('Open menu')).toBeTruthy()
  })

  it('should toggle mobile menu on click', async () => {
    render(<Navigation />)
    await waitFor(() => {
      expect(screen.getByLabelText('Open menu')).toBeTruthy()
    })
    fireEvent.click(screen.getByLabelText('Open menu'))
    expect(screen.getByLabelText('Close menu')).toBeTruthy()
  })
})
