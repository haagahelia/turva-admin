import { NavLink } from 'react-router-dom';
import { navLinks } from '../constants';
import { useAuth } from '../auth/authContext';

const Sidepanel = () => {
	const { profile, logout } = useAuth();

	return (
		<section className='sm:w-60 lg:w-80 shrink-0 flex flex-col h-dvh bg-[#273444]'>
			<div className='h-20 py-3 flex flex-col items-center justify-center'>
				<span className='font-medium text-xl text-white'>Turva Dashboard</span>
				<div className='mt-2 h-px w-[92%] rounded-full bg-linear-to-r from-transparent via-slate-500 to-transparent' />
			</div>

			<ul className='flex flex-col justify-center gap-1'>
				{navLinks.map((link, index) => (
					<li key={index}>
						<NavLink
							to={link.link}
							className={({ isActive }) =>
								`block h-10 m-1 p-2 rounded-sm hover:bg-[#0472ED] ${isActive ? 'bg-[#0472ED]' : ''}`
							}
						>
							<span className='text-white font-normal'>{link.name}</span>
						</NavLink>
					</li>
				))}
			</ul>

			<div className='mt-auto w-full flex justify-between items-center h-20 p-2'>
				<div className='flex min-w-0 items-center gap-1.5'>
					{/* Placeholder for an admin image */}
					<div className='bg-gray-400 rounded-full w-12.5 h-12.5 shrink-0' />
					<span className='truncate text-white font-normal' title={profile?.email}>
						{profile?.profileName}
					</span>
				</div>
				<button
					type='button'
					onClick={logout}
					className='text-white px-3 py-1.5 transition-all hover:cursor-pointer hover:bg-amber-50/10 rounded-2xl'
				>
					Logout
				</button>
			</div>
		</section>
	);
};

export default Sidepanel;
