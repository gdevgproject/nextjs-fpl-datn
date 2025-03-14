import type { BaseEntity } from "../../types/common"

export interface GrowTrackData extends BaseEntity {
  status: number
  gender: number
  height: number
  weight: number
  birthday: string
  phone: string
  name?: string
  note?: string
  files?: string[]
  type?: number
  images?: string[]
}

export interface GrowTrackResult {
  ageHeightNow: Array<{ age: number; height: number }>
  ageHeightP3: Array<{ age: number; height: number }>
  ageHeightP5: Array<{ age: number; height: number }>
  ageHeightP10: Array<{ age: number; height: number }>
  ageHeightP25: Array<{ age: number; height: number }>
  ageHeightP50: Array<{ age: number; height: number }>
  ageHeightP75: Array<{ age: number; height: number }>
  ageHeightP90: Array<{ age: number; height: number }>
  ageHeightP95: Array<{ age: number; height: number }>
  ageHeightP97: Array<{ age: number; height: number }>
  hdfs: number
  whoHS: number
  wdfs: number
  whoWS: number
}

export interface CreateGrowTrackParams {
  optionSeller: number
  phone: string
  contactID?: string
  status?: number
  birthday: string
  gender: number
  height: number
  weight: number
  name?: string
  note?: string
  filesID?: string[]
}

