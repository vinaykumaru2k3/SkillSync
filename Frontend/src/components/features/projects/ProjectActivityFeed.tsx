'use client'

import { useState, useEffect } from 'react'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { Card } from '@/components/common/Card'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
    id: string
    type: 'COMMENT' | 'UPDATE' | 'MEMBER_JOINED' | 'TASK_COMPLETED'
    content: string
    userId: string
    userName: string
    createdAt: string
}

interface ProjectActivityFeedProps {
    projectId: string
}

export function ProjectActivityFeed({ projectId }: ProjectActivityFeedProps) {
    const [activities, setActivities] = useState<Activity[]>([])
    const { subscribe, isConnected } = useWebSocket()

    useEffect(() => {
        // Mock initial data
        setActivities([
            {
                id: '1',
                type: 'UPDATE',
                content: 'Project description updated',
                userId: 'user1',
                userName: 'John Doe',
                createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
            },
            {
                id: '2',
                type: 'COMMENT',
                content: 'Great progress on the frontend!',
                userId: 'user2',
                userName: 'Jane Smith',
                createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
            },
        ])
    }, [])

    useEffect(() => {
        if (!isConnected || !projectId) return

        const topic = `/topic/project/${projectId}/activity`
        console.log(`Subscribing to ${topic}`)

        const unsubscribe = subscribe(topic, (activity: Activity) => {
            console.log('Received activity:', activity)
            setActivities((prev) => [activity, ...prev])
        })

        return () => {
            unsubscribe()
        }
    }, [isConnected, projectId, subscribe])

    const getActivityIcon = (type: Activity['type']) => {
        switch (type) {
            case 'COMMENT':
                return '💬'
            case 'UPDATE':
                return '📝'
            case 'MEMBER_JOINED':
                return '👋'
            case 'TASK_COMPLETED':
                return '✅'
            default:
                return '•'
        }
    }

    return (
        <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Project Activity</h3>
            <div className="space-y-4">
                {activities.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {activity.userName}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {activity.content}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    )
}
