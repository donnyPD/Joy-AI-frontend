import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

interface JobsResponse {
  data: {
    jobs: {
      pageInfo: {
        hasNextPage: boolean
        endCursor: string | null
      }
      nodes: Array<{
        id: string
        jobNumber: string
        title: string | null
        jobStatus: string
        jobType: string | null
        createdAt: string
        startAt: string | null
        endAt: string | null
        client: {
          id: string
          name: string
          firstName: string | null
          lastName: string | null
          companyName: string | null
        } | null
        property: {
          id: string
          name: string | null
          address: {
            street: string | null
            city: string | null
            province: string | null
            postalCode: string | null
          } | null
        } | null
      }>
    }
  }
}

export const fetchJobs = createAsyncThunk<JobsResponse, { first?: number; after?: string }, { rejectValue: string }>(
  'jobs/fetchJobs',
  async ({ first = 100, after }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (first) params.append('first', first.toString())
      if (after) params.append('after', after)
      
      const response = await api.get<JobsResponse>(`/jobber/jobs?${params.toString()}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to fetch jobs'
      )
    }
  }
)
