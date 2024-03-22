import { Experiment } from '../types'

export const EXPERIMENTS_MOCK: Experiment[] = [
  {
    name: 'EX-107',
    variants: [],
  },
  {
    name: 'EX-123',
    variants: [
      { name: 'B', id: '1234567890' },
      { name: 'C', id: '0987654321' },
    ],
  },
  {
    name: 'EX-184',
    variants: [{ name: 'B', id: '1234509876' }],
  },
]
