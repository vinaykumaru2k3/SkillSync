'use client'

import { useState } from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'

export default function ContentModerationPage() {
    const [reports, setReports] = useState([
        { id: '1', type: 'Comment', content: 'This is spam content!', reporter: 'user1', status: 'Pending' },
        { id: '2', type: 'Project', content: 'Inappropriate project description...', reporter: 'user2', status: 'Pending' },
        { id: '3', type: 'User Bio', content: 'Offensive bio text', reporter: 'user3', status: 'Resolved' },
    ])

    const handleAction = (id: string, action: 'Approve' | 'Delete') => {
        setReports(reports.filter(r => r.id !== id))
        // In real app, call API to update status
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Moderation</h1>

            <div className="grid gap-4">
                {reports.map((report) => (
                    <Card key={report.id} className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        {report.type}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Reported by {report.reporter}
                                    </span>
                                </div>
                                <p className="text-gray-900 dark:text-white mb-4">{report.content}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleAction(report.id, 'Approve')}>
                                    Ignore
                                </Button>
                                <Button variant="primary" size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleAction(report.id, 'Delete')}>
                                    Remove
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
                {reports.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">No pending reports.</p>
                )}
            </div>
        </div>
    )
}
