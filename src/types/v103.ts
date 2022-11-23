import type {Result, Option} from './support'

export type Bounded = Bounded_Legacy | Bounded_Inline | Bounded_Lookup

export interface Bounded_Legacy {
  __kind: 'Legacy'
  hash: Uint8Array
}

export interface Bounded_Inline {
  __kind: 'Inline'
  value: Uint8Array
}

export interface Bounded_Lookup {
  __kind: 'Lookup'
  hash: Uint8Array
  len: number
}
