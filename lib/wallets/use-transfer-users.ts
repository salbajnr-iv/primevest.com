"use client"

import useSWR from 'swr'
import type { User } from '@/types/wallet'

const SEARCH_USERS_URL = '/api/wallets/transfer/users'

interface UseTransferUsersProps {
  search: string
}

export function useTransferUsers({ search }: UseTransferUsersProps) {
  const key = search ? `${SEARCH_USERS_URL}?search=${encodeURIComponent(search)}` : null

  const { data, error, isLoading } = useSWR<User[], Error>(
    key,
    async (url: string) => {
      const body = { search }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error('Failed to search users')
      return res.json()
    }
  )

  return {
    users: data || [],
    isLoading,
    error
  }
}
