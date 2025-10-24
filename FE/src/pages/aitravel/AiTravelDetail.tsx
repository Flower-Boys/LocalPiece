import React from "react"
import { useLocation } from "react-router-dom";
import { getTourCommon } from "@/api";
import { TripResponse } from "@/types/aiTravel"

const AiTravelDetail: React.FC = () => {
 const state = useLocation() as {state: TripResponse[]}
 // console.log(state.state.course)
// getTourCommon(state.id),
  return <div>AI 여행 상세</div>;
};
export default AiTravelDetail;