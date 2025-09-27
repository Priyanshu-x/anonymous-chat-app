import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserManagement = ({ token }) => {
	const [users, setUsers] = useState([]);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUsers = async () => {
			setLoading(true);
			setError('');
			try {
				const res = await axios.get('/api/admin/users', {
					headers: { Authorization: `Bearer ${token}` }
				});
				setUsers(res.data);
			} catch (err) {
				setError('Failed to fetch users');
			} finally {
				setLoading(false);
			}
		};
		if (token) fetchUsers();
	}, [token]);

	const handleBanToggle = async (userId) => {
		try {
			await axios.post(`/api/admin/users/${userId}/ban`, {}, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setUsers(users => users.map(u => u._id === userId ? { ...u, isBanned: !u.isBanned } : u));
		} catch (err) {
			setError('Failed to update user status');
		}
	};

	if (loading) return <div>Loading users...</div>;
	if (error) return <div className="text-red-500">{error}</div>;

	return (
		<div className="bg-white p-6 rounded shadow mt-6">
			<h2 className="text-xl font-bold mb-4">User Management</h2>
			<table className="w-full border">
				<thead>
					<tr className="bg-gray-100">
						<th className="p-2">Username</th>
						<th className="p-2">Avatar</th>
						<th className="p-2">Joined</th>
						<th className="p-2">Messages</th>
						<th className="p-2">Status</th>
						<th className="p-2">Action</th>
					</tr>
				</thead>
				<tbody>
					{users.map(user => (
						<tr key={user._id} className={user.isBanned ? 'bg-red-50' : ''}>
							<td className="p-2">{user.username}</td>
							<td className="p-2"><img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full" /></td>
							<td className="p-2">{new Date(user.joinedAt).toLocaleDateString()}</td>
							<td className="p-2">{user.messageCount}</td>
							<td className="p-2">{user.isBanned ? 'Banned' : 'Active'}</td>
							<td className="p-2">
								<button
									className={`px-3 py-1 rounded ${user.isBanned ? 'bg-green-500' : 'bg-red-500'} text-white`}
									onClick={() => handleBanToggle(user._id)}
								>
									{user.isBanned ? 'Unban' : 'Ban'}
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default UserManagement;
