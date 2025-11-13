'use client'

import Link from 'next/link'
import { UserProfile } from '@/types/user'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'

interface UserProfileCardProps {
  profile: UserProfile
}

export function UserProfileCard({ profile }: UserProfileCardProps) {
  return (
    <Link href={`/profile/${profile.userId}`}>
      <Card className="h-full transition-shadow hover:shadow-lg">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={profile.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {profile.displayName}
            </h3>
            
            {profile.location && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{profile.location}</p>
            )}

            {profile.bio && (
              <p className="mt-2 line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
                {profile.bio}
              </p>
            )}

            {profile.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.skills.slice(0, 5).map((skill) => (
                  <Badge
                    key={skill.id}
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {skill.name}
                  </Badge>
                ))}
                {profile.skills.length > 5 && (
                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    +{profile.skills.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
