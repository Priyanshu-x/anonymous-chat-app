import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminStats = ({ token }) => {
	const [stats, setStats] = useState(null);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			setLoading(true);
			setError('');
			try {
				const res = await axios.get('/api/admin/stats', {
					headers: { Authorization: `Bearer ${token}` }
				});
				setStats(res.data);
			} catch (err) {
				setError('Failed to fetch stats');
			} finally {
				setLoading(false);
			}
		};
		if (token) fetchStats();
	}, [token]);

	if (loading) return <div>Loading stats...</div>;
	if (error) return <div className="text-red-500">{error}</div>;
	if (!stats) return null;

	return (
		<div className="bg-white p-6 rounded shadow mt-6">
			<h2 className="text-xl font-bold mb-4">Admin Stats</h2>
			<ul className="space-y-2">
				<li>Active Users: <span className="font-semibold">{stats.activeUsers}</span></li>
				<li>Total Messages: <span className="font-semibold">{stats.totalMessages}</span></li>
				<li>Voice Messages: <span className="font-semibold">{stats.voiceMessages}</span></li>
				<li>Image Messages: <span className="font-semibold">{stats.imageMessages}</span></li>
				<li>Pinned Messages: <span className="font-semibold">{stats.pinnedMessages}</span></li>
				<li>Messages (Last 24h): <span className="font-semibold">{stats.messagesLast24h}</span></li>
			</ul>
		</div>
	);
};

export default AdminStats;
