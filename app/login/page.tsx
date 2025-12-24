'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/otp-input'
import { toast } from 'sonner'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/utils/cn'

export default function LoginPage() {
    const [step, setStep] = useState<'email' | 'otp'>('email')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleSendOtp = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!email) {
            toast.error('Please enter your email address.')
            return
        }
        setIsLoading(true)

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
            },
        })

        setIsLoading(false)

        if (error) {
            toast.error(error.message)
        } else {
            setStep('otp')
            toast.success('OTP sent to your email!')
        }
    }

    const handleVerifyOtp = async (code: string) => {
        setOtp(code)
        if (code.length === 6) {
            setIsLoading(true)

            // First try verify as email (magic link login)
            let { error } = await supabase.auth.verifyOtp({
                email,
                token: code,
                type: 'email',
            })

            // If failed, try verify as signup (new user confirmation)
            if (error) {
                console.log('Login verification failed, trying signup verification...')
                const { error: signupError } = await supabase.auth.verifyOtp({
                    email,
                    token: code,
                    type: 'signup',
                })
                error = signupError
            }

            if (error) {
                setIsLoading(false)
                toast.error(error.message)
                setOtp('')
            } else {
                toast.success('Successfully logged in!')
                router.push('/')
            }
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {step === 'email' ? 'Welcome' : 'Verify your email'}
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {step === 'email'
                            ? 'Enter your email to sign in or create an account'
                            : `We sent a 6-digit code to ${email}`}
                    </p>
                </div>

                {step === 'email' ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                            {isLoading ? 'Sending code...' : 'Continue with Email'}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 underline"
                                onClick={() => toast.info('Enter your email and valid OTP to reset password or login.')}
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={handleVerifyOtp}
                                disabled={isLoading}
                            >
                                <InputOTPGroup className="gap-2">
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <Button
                            className={cn(
                                "w-full bg-transparent text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800 shadow-none ring-0 border border-zinc-200 dark:border-zinc-800"
                            )}
                            onClick={() => setStep('email')}
                            disabled={isLoading}
                            type="button"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Change Email
                        </Button>

                        <p className="text-center text-xs text-zinc-500">
                            Didn't receive the code?{' '}
                            <button
                                type="button"
                                className="underline hover:text-zinc-900 dark:hover:text-zinc-50"
                                onClick={() => handleSendOtp()}
                                disabled={isLoading}
                            >
                                Resend
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div >
    )
}
