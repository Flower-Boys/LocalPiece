import apiClient from "./client"
import {VisitCreateRequest, TripResponse} from "@/types/aiTravel"

export const CoursesGenerate = async (payload: VisitCreateRequest) => {
  const { data } = await apiClient.post<TripResponse>("/courses/generate", payload);
  return data
}