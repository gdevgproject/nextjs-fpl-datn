import { BaseService } from "../api/baseService"
import type { PaginatedResponse, PaginationParams } from "../types/common"
import type { CreateGrowTrackParams, GrowTrackData, GrowTrackResult } from "./types/growTrackTypes"

export class GrowTrackService extends BaseService {
  constructor() {
    super("/api/crm/grow_track")
  }

  async create(params: CreateGrowTrackParams): Promise<{ data: GrowTrackData; growTrack: GrowTrackResult }> {
    return this.post("", params)
  }

  async getById(trackId: string): Promise<GrowTrackData> {
    return this.get(`/${trackId}`)
  }

  async update(trackId: string, params: Partial<CreateGrowTrackParams>): Promise<GrowTrackData> {
    return this.put(`/${trackId}`, params)
  }

  async getList(params?: PaginationParams & { contactId?: string }): Promise<PaginatedResponse<GrowTrackData>> {
    return this.get("", params)
  }
}

export const growTrackService = new GrowTrackService()

