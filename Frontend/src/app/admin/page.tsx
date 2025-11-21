'use client'

import { Card } from '@/components/common/Card'

export default function AdminDashboardPage() {
    const services = [
        { name: 'API Gateway', status: 'Online', latency: '45ms' },
        { name: 'Auth Service', status: 'Online', latency: '120ms' },
        { name: 'User Service', status: 'Online', latency: '85ms' },
        { name: 'Project Service', status: 'Online', latency: '92ms' },
        { name: 'Collaboration Service', status: 'Online', latency: '78ms' },
        { name: 'GitHub Sync Service', status: 'Online', latency: '150ms' },
    ]

    const metrics = [
        { label: 'Total Users', value: '1,234', change: '+12%' },
        { label: 'Active Projects', value: '856', change: '+5%' },
        { label: 'Open Collaborations', value: '142', change: '+8%' },
        { label: 'GitHub Repos Synced', value: '3,421', change: '+15%' },
    ]

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Dashboard</h1>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric) => (
                    <Card key={metric.label} className="p-6">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.label}</h3>
                        <div className="mt-2 flex items-baseline">
                            <p className="text-3xl font-semibold text-gray-900 dark:text-white">{metric.value}</p>
                            <span className="ml-2 text-sm font-medium text-green-600">{metric.change}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* System Health */}
            <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Health Status</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Latency</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {services.map((service) => (
                                <tr key={service.name}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{service.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            {service.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{service.latency}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
