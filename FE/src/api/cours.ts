import apiClient from "./client"
import {VisitCreateRequest, TripResponse, CourseDetailResponse} from "@/types/aiTravel"

export const coursesGenerate = async (payload: VisitCreateRequest) => {
  const { data } = await apiClient.post<TripResponse>("/courses/generate", payload);
  return data
}

export const getCourseDetail = async (contentId:string) => {
  const res = await apiClient.get<CourseDetailResponse>(`/saved-courses/${contentId}`)
  return res.data
}