import React, { useState } from 'react';
import axios from 'axios';

const AdminLogin = ({ onLogin }) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const res = await axios.post('/api/admin/login', { username, password });
			if (onLogin) onLogin(res.data);
		} catch (err) {
			setError(err.response?.data?.error || 'Login failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
			<h2 className="text-2xl font-bold mb-4">Admin Login</h2>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Username"
					value={username}
					onChange={e => setUsername(e.target.value)}
					className="w-full mb-3 p-2 border rounded"
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={e => setPassword(e.target.value)}
					className="w-full mb-3 p-2 border rounded"
					required
				/>
				{error && <div className="text-red-500 mb-2">{error}</div>}
				<button
					type="submit"
					className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
					disabled={loading}
				>
					{loading ? 'Logging in...' : 'Login'}
				</button>
			</form>
		</div>
	);
};

export default AdminLogin;
