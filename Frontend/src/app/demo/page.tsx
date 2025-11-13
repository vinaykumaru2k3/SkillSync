'use client'

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Badge,
  Skeleton,
  SkeletonCard,
  ThemeToggle,
  Modal,
} from '@/components/common'
import { useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/common/Toast'

export default function DemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toasts, removeToast, success, error, warning, info } = useToast()

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Design System Demo
          </h1>
          <ThemeToggle />
        </div>

        {/* Buttons */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" isLoading>
                Loading
              </Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input label="Email" type="email" placeholder="Enter your email" />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                helperText="Must be at least 8 characters"
              />
              <Input
                label="Username"
                type="text"
                placeholder="Enter username"
                error="Username is already taken"
              />
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card variant="default">
            <CardTitle>Default Card</CardTitle>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                This is a default card with no border or shadow.
              </p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardTitle>Bordered Card</CardTitle>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                This card has a subtle border.
              </p>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardTitle>Elevated Card</CardTitle>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                This card has a shadow for elevation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Skeletons */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Loading Skeletons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton variant="text" />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rectangular" height={100} />
              <div className="flex items-center space-x-4">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="70%" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toasts */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Toast Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => success('Operation completed successfully!')}>
                Show Success
              </Button>
              <Button onClick={() => error('An error occurred!')}>Show Error</Button>
              <Button onClick={() => warning('This is a warning!')}>Show Warning</Button>
              <Button onClick={() => info('Here is some information')}>Show Info</Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Modal</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Example Modal"
            >
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                This is a modal dialog. Press ESC or click outside to close.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  Confirm
                </Button>
              </div>
            </Modal>
          </CardContent>
        </Card>

        {/* Responsive Grid */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Responsive Grid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="rounded-lg bg-primary-100 p-4 text-center dark:bg-primary-900"
                >
                  Item {i}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
