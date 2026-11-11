import { useState } from 'react';
import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/apiFetch';
import { useAuth } from '../auth/authContext';
import type { AdminProfile } from '../auth/session';

const credentialsSchema = z.object({
	email: z.string().trim().pipe(z.email('Enter a valid email address')),
	username: z.string().trim().min(1, 'Enter your username'),
});
type Credentials = z.infer<typeof credentialsSchema>;

const codeSchema = z.object({
	code: z
		.string()
		.trim()
		.regex(/^\d{6}$/, 'The code has 6 digits'),
});
type CodeForm = z.infer<typeof codeSchema>;

const messageFor = (error: unknown, fallback: string): string => {
	if (error instanceof ApiError) {
		if (error.status === 401) return fallback;
		return error.message;
	}
	return 'Could not reach the server. Check your connection and try again.';
};

const inputClass =
	'mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none';
const buttonClass =
	'w-full rounded bg-blue-500 p-2 text-white hover:cursor-pointer hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60';

const Login = () => {
	const { token, login, sessionExpired } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const from = (location.state as { from?: string } | null)?.from ?? '/quizzes';

	const [credentials, setCredentials] = useState<Credentials | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<string | null>(null);

	const credentialsForm = useForm<Credentials>({
		resolver: zodResolver(credentialsSchema),
		defaultValues: { email: '', username: '' },
	});
	const codeForm = useForm<CodeForm>({
		resolver: zodResolver(codeSchema),
		defaultValues: { code: '' },
	});
	// Read errors through useFormState, not form.formState: the React Compiler
	// caches the render and would never show updated errors otherwise.
	const credentialsState = useFormState({ control: credentialsForm.control });
	const codeState = useFormState({ control: codeForm.control });

	if (token) {
		return <Navigate to={from} replace />;
	}

	const requestCode = async (values: Credentials) => {
		setError(null);
		setInfo(null);
		try {
			await apiFetch('/api/auth/login', {
				method: 'POST',
				body: values,
				token: null,
			});
			setCredentials(values);
			setInfo(`We sent a 6-digit code to ${values.email}.`);
		} catch (err) {
			setError(messageFor(err, 'No account matches this email and username.'));
		}
	};

	const verifyCode = async ({ code }: CodeForm) => {
		if (!credentials) return;
		setError(null);
		try {
			const { token: newToken } = await apiFetch<{ token: string }>(
				'/api/auth/verify',
				{
					method: 'POST',
					body: { ...credentials, verificationCode: code },
					token: null,
				},
			);
			const profile = await apiFetch<AdminProfile>('/api/user/profile', {
				token: newToken,
			});
			if (profile.role !== 'admin') {
				setError(
					'This account does not have admin access. Ask an administrator to grant it.',
				);
				return;
			}
			login({ token: newToken, profile });
			navigate(from, { replace: true });
		} catch (err) {
			setError(messageFor(err, 'This code is invalid or has expired.'));
		}
	};

	const switchAccount = () => {
		setCredentials(null);
		setError(null);
		setInfo(null);
		codeForm.reset();
	};

	return (
		<main className='flex min-h-dvh items-center justify-center bg-gray-200 p-4'>
			<section className='w-full max-w-sm rounded-md bg-white p-6 shadow'>
				<h1 className='text-2xl font-semibold'>Turva Dashboard</h1>
				<p className='mt-1 text-sm text-gray-600'>
					{credentials ?
						'Enter the code from your email.'
					:	'Sign in with your admin account.'}
				</p>

				{sessionExpired && !credentials ?
					<p role='status' className='mt-4 rounded bg-amber-100 p-2 text-sm'>
						Your session has expired. Please sign in again.
					</p>
				:	null}
				{info ?
					<p role='status' className='mt-4 rounded bg-blue-50 p-2 text-sm'>
						{info}
					</p>
				:	null}
				{error ?
					<p role='alert' className='mt-4 rounded bg-red-50 p-2 text-sm text-red-700'>
						{error}
					</p>
				:	null}

				{credentials ?
					<form
						noValidate
						className='mt-4 flex flex-col gap-4'
						onSubmit={codeForm.handleSubmit(verifyCode)}
					>
						<label className='text-sm font-medium'>
							Verification code
							<input
								className={inputClass}
								inputMode='numeric'
								autoComplete='one-time-code'
								autoFocus
								{...codeForm.register('code')}
							/>
						</label>
						{codeState.errors.code ?
							<p className='-mt-3 text-sm text-red-700'>
								{codeState.errors.code.message}
							</p>
						:	null}
						<button
							type='submit'
							className={buttonClass}
							disabled={codeState.isSubmitting}
						>
							Sign in
						</button>
						<div className='flex justify-between text-sm'>
							<button
								type='button'
								className='text-blue-600 hover:cursor-pointer hover:underline'
								onClick={switchAccount}
							>
								Use another account
							</button>
							<button
								type='button'
								className='text-blue-600 hover:cursor-pointer hover:underline'
								onClick={() => requestCode(credentials)}
							>
								Send a new code
							</button>
						</div>
					</form>
				:	<form
						noValidate
						className='mt-4 flex flex-col gap-4'
						onSubmit={credentialsForm.handleSubmit(requestCode)}
					>
						<label className='text-sm font-medium'>
							Email
							<input
								type='email'
								className={inputClass}
								autoComplete='email'
								{...credentialsForm.register('email')}
							/>
						</label>
						{credentialsState.errors.email ?
							<p className='-mt-3 text-sm text-red-700'>
								{credentialsState.errors.email.message}
							</p>
						:	null}
						<label className='text-sm font-medium'>
							Username
							<input
								className={inputClass}
								autoComplete='username'
								{...credentialsForm.register('username')}
							/>
						</label>
						{credentialsState.errors.username ?
							<p className='-mt-3 text-sm text-red-700'>
								{credentialsState.errors.username.message}
							</p>
						:	null}
						<button
							type='submit'
							className={buttonClass}
							disabled={credentialsState.isSubmitting}
						>
							Send code
						</button>
					</form>
				}
			</section>
		</main>
	);
};

export default Login;
